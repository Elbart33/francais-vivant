/**
 * Genere data/lexique.ar.json : dictionnaire statique
 * { mot_arabe -> { meaningFr, meaningDarija, phonetic } }
 * pour les mots complexes trouves dans situations.ar.json.
 *
 * A lancer manuellement :
 *   node scripts/generate-lexicon-ar.js
 *
 * Necessite GEMINI_API_KEY ou MISTRAL_API_KEY dans l'environnement.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const situations = require(path.join(ROOT, "data/situations.ar.json"));
const idioms = require(path.join(ROOT, "data/idioms.ar.json"));
const commonWords = require(path.join(ROOT, "data/common-words.ar.json"));

const LEXICON_PATH = path.join(ROOT, "data/lexique.ar.json");

const commonSet = new Set(commonWords.map((w) => w.trim()));
const idiomWords = new Set(
  idioms.flatMap((i) => i.expression.split(/[\s()\/]+/)).filter(Boolean)
);

function extractCandidateWords() {
  const words = new Set();
  for (const situation of situations) {
    const texts = [situation.context, situation.task, situation.summary].filter(Boolean);
    for (const text of texts) {
      const tokens = text
        .replace(/[«»"\u201c\u201d.,;:!?()]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      for (const token of tokens) {
        if (
          token.length > 3 &&
          !commonSet.has(token) &&
          !idiomWords.has(token)
        ) {
          words.add(token);
        }
      }
    }
  }
  return Array.from(words);
}

async function fetchDefinition(word, apiKey, provider) {
  const prompt = `Pour le mot arabe/darija "${word}", donne UNIQUEMENT un objet JSON strict, sans texte autour, avec ce format exact :
{"meaningFr": "traduction courte en francais", "meaningDarija": "explication courte en darija (ecriture arabe)", "phonetic": "transcription latine simple de la prononciation, ex: [salam]"}`;

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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
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
    if (!res.ok) {
      throw new Error(`Mistral API error ${res.status}: ${JSON.stringify(data)}`);
    }
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error(`Reponse Mistral vide pour ce mot: ${JSON.stringify(data)}`);
    }
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!parsed.meaningFr && !parsed.meaningDarija) {
      throw new Error(`JSON valide mais vide de contenu pour ce mot`);
    }
    return parsed;
  }
  throw new Error("Aucun fournisseur configure");
}

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  const provider = geminiKey ? "gemini" : mistralKey ? "mistral" : null;
  const apiKey = geminiKey || mistralKey;

  if (!provider) {
    console.error("ERREUR: aucune cle GEMINI_API_KEY ou MISTRAL_API_KEY trouvee.");
    process.exit(1);
  }

  let existing = {};
  if (fs.existsSync(LEXICON_PATH)) {
    existing = JSON.parse(fs.readFileSync(LEXICON_PATH, "utf-8"));
  }

  const candidates = extractCandidateWords();
  const toGenerate = candidates.filter((w) => !existing[w] || (!existing[w].meaningFr && !existing[w].meaningDarija));

  console.log(`${candidates.length} mots candidats, ${toGenerate.length} nouveaux (fournisseur: ${provider}).`);

for (const word of toGenerate) {
    let success = false;
    for (let attempt = 1; attempt <= 4 && !success; attempt++) {
      try {
        console.log(`Generation: ${word} (tentative ${attempt})...`);
        const def = await fetchDefinition(word, apiKey, provider);
        existing[word] = def;
        fs.writeFileSync(LEXICON_PATH, JSON.stringify(existing, null, 2), "utf-8");
        success = true;
      } catch (err) {
        console.error(`Echec pour "${word}" (tentative ${attempt}): ${err.message}`);
        if (attempt < 4) {
          const wait = attempt * 8000;
          console.log(`Attente de ${wait / 1000}s avant nouvelle tentative...`);
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log(`Termine. Lexique sauvegarde dans ${LEXICON_PATH}`);
}

main();
