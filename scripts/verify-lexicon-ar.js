/**
 * Repasse sur chaque mot de data/lexique.ar.json avec son contexte reel
 * (phrase d'origine dans situations.ar.json) pour :
 * - detecter et retirer les noms propres (prenoms, noms de famille, villes...)
 * - corriger les definitions visiblement fausses
 *
 * A lancer manuellement :
 *   node scripts/verify-lexicon-ar.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const situations = require(path.join(ROOT, "data/situations.ar.json"));
const LEXICON_PATH = path.join(ROOT, "data/lexique.ar.json");

const lexicon = JSON.parse(fs.readFileSync(LEXICON_PATH, "utf-8"));

function findExampleSentence(word) {
  for (const situation of situations) {
    const texts = [situation.context, situation.task, situation.summary].filter(Boolean);
    for (const text of texts) {
      if (text.includes(word)) return text;
    }
  }
  return null;
}

async function verifyWord(word, entry, sentence, apiKey, provider) {
  const prompt = `Dans la phrase arabe/darija suivante : "${sentence}"
Le mot "${word}" a ete traduit ainsi : meaningFr="${entry.meaningFr}", meaningDarija="${entry.meaningDarija}", phonetic="${entry.phonetic}".

Verifie cette traduction dans le contexte de la phrase. Reponds UNIQUEMENT avec un objet JSON strict, sans texte autour :
- Si "${word}" est un nom propre (prenom, nom de famille, ville, marque) : {"isProperNoun": true}
- Si la traduction est correcte telle quelle : {"isProperNoun": false, "meaningFr": "${entry.meaningFr}", "meaningDarija": "${entry.meaningDarija}", "phonetic": "${entry.phonetic}"}
- Si la traduction est fausse ou approximative : {"isProperNoun": false, "meaningFr": "traduction corrigee", "meaningDarija": "explication corrigee", "phonetic": "phonetique corrigee"}`;

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(`Gemini error: ${JSON.stringify(data)}`);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Reponse vide");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  }

  if (provider === "mistral") {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Mistral error: ${JSON.stringify(data)}`);
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Reponse vide");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  }

  throw new Error("Aucun fournisseur configure");
}

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  const provider = geminiKey ? "gemini" : mistralKey ? "mistral" : null;
  const apiKey = geminiKey || mistralKey;

  if (!provider) {
    console.error("ERREUR: aucune cle trouvee.");
    process.exit(1);
  }

  const words = Object.keys(lexicon);
  console.log(`Verification de ${words.length} mots (fournisseur: ${provider}).`);

  let removed = 0;
  let corrected = 0;

  for (const word of words) {
    const sentence = findExampleSentence(word);
    if (!sentence) continue;

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        console.log(`Verification: ${word} (tentative ${attempt})...`);
        const result = await verifyWord(word, lexicon[word], sentence, apiKey, provider);

        if (result.isProperNoun) {
          console.log(`  -> Nom propre detecte, suppression de "${word}"`);
          delete lexicon[word];
          removed++;
        } else {
          const changed =
            result.meaningFr !== lexicon[word].meaningFr ||
            result.meaningDarija !== lexicon[word].meaningDarija;
          if (changed) {
            console.log(`  -> Correction appliquee pour "${word}"`);
            corrected++;
          }
          lexicon[word] = {
            meaningFr: result.meaningFr,
            meaningDarija: result.meaningDarija,
            phonetic: result.phonetic,
          };
        }
        fs.writeFileSync(LEXICON_PATH, JSON.stringify(lexicon, null, 2), "utf-8");
        success = true;
      } catch (err) {
        console.error(`Echec pour "${word}" (tentative ${attempt}): ${err.message}`);
        if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 8000));
      }
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`Termine. ${removed} noms propres retires, ${corrected} definitions corrigees.`);
}

main();
