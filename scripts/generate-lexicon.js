/**
 * Genere data/lexique.fr.json : un dictionnaire statique
 * { mot -> { meaningDarija, phonetic } } pour tous les mots "complexes"
 * (pas dans common-words.fr.json, pas deja un idiome) trouves dans situations.fr.json.
 *
 * A lancer manuellement, PAS a chaque build :
 *   node scripts/generate-lexicon.js
 *
 * Necessite une des cles suivantes dans l'environnement :
 *   GEMINI_API_KEY ou MISTRAL_API_KEY
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const situations = require(path.join(ROOT, "data/situations.fr.json"));
const idioms = require(path.join(ROOT, "data/idioms.fr.json"));
const commonWords = require(path.join(ROOT, "data/common-words.fr.json"));

const LEXICON_PATH = path.join(ROOT, "data/lexique.fr.json");

const commonSet = new Set(commonWords.map((w) => w.toLowerCase()));
const idiomExpressions = new Set(
  idioms.flatMap((i) => i.expression.toLowerCase().split(/\s+/))
);

function extractCandidateWords() {
  const words = new Set();
  for (const situation of situations) {
    const texts = [situation.context, situation.task, situation.summary].filter(Boolean);
    for (const text of texts) {
      const tokens = text
        .toLowerCase()
        .replace(/[«»"“”.,;:!?()]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      for (const token of tokens) {
        if (
          token.length > 6 &&
          !commonSet.has(token) &&
          !idiomExpressions.has(token) &&
          !/^\d+$/.test(token)
        ) {
          words.add(token);
        }
      }
    }
  }
  return Array.from(words);
}

async function fetchDefinition(word, apiKey, provider) {
  const prompt = `Pour le mot francais "${word}", donne UNIQUEMENT un objet JSON strict, sans texte autour, avec ce format exact :
{"meaningDarija": "traduction ou explication courte en darija (transcription latine)", "phonetic": "prononciation approximative du mot francais, simple, ex: [bon-jour]"}`;

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
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
    const text = data.choices?.[0]?.message?.content || "{}";
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
    console.error("ERREUR: aucune cle GEMINI_API_KEY ou MISTRAL_API_KEY trouvee dans l'environnement.");
    process.exit(1);
  }

  let existing = {};
  if (fs.existsSync(LEXICON_PATH)) {
    existing = JSON.parse(fs.readFileSync(LEXICON_PATH, "utf-8"));
  }

  const candidates = extractCandidateWords();
  const toGenerate = candidates.filter((w) => !existing[w]);

  console.log(`${candidates.length} mots candidats, ${toGenerate.length} nouveaux a generer (fournisseur: ${provider}).`);

  for (const word of toGenerate) {
    try {
      console.log(`Generation: ${word}...`);
      const def = await fetchDefinition(word, apiKey, provider);
      existing[word] = def;
      fs.writeFileSync(LEXICON_PATH, JSON.stringify(existing, null, 2), "utf-8");
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Echec pour "${word}": ${err.message}`);
    }
  }

  console.log(`Termine. Lexique sauvegarde dans ${LEXICON_PATH}`);
}

main();
