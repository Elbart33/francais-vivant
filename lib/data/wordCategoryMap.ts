import { CorrectionCategory } from "@/types";

/**
 * Association mot -> categorie d'erreur, utilisee pour biaiser silencieusement
 * l'ordre d'affichage de wordBank vers les points faibles de l'utilisateur
 * (principe 6 de la vision pedagogique). Ne jamais afficher cette categorie
 * a l'utilisateur, uniquement s'en servir pour trier.
 */
export const wordCategoryMap: Record<string, CorrectionCategory> = {
  // verbes a l'infinitif -> conjugaison
  "accepter": "conjugaison",
  "confirmer": "conjugaison",
  "consulter": "conjugaison",
  "convenir": "conjugaison",
  "essayer": "conjugaison",
  "vouloir": "conjugaison",
  "acheter": "conjugaison",
  "perdre": "conjugaison",
  "bloquer": "conjugaison",
  "attendre": "conjugaison",
  "manquer": "conjugaison",
  "apporter": "conjugaison",
  "préférer": "conjugaison",
  "réserver": "conjugaison",
  "vérifier": "conjugaison",
  "demander": "conjugaison",
  "payer": "conjugaison",
  "reporter": "conjugaison",

  // noms avec genre a retenir -> genre
  "rendez-vous": "genre",
  "urgence": "genre",
  "internet": "genre",
  "panne": "genre",
  "voyant": "genre",
  "dossier": "genre",
  "justificatif": "genre",
  "domicile": "genre",
  "date": "genre",
  "tomate": "genre",
  "kilo": "genre",
  "prix": "genre",
  "légume": "genre",
  "carte": "genre",
  "opposition": "genre",
  "colis": "genre",
  "semaine": "genre",
  "suivi": "genre",
  "réclamation": "genre",
  "document": "genre",
  "certificat": "genre",
  "créneau": "genre",
  "matin": "genre",
  "après-midi": "genre",
  "table": "genre",
  "personne": "genre",
  "salaire": "genre",
  "retard": "genre",
  "facture": "genre",
  "délai": "genre",
  "nom": "genre",

  // expressions figees / marqueurs temporels -> lexique
  "avoir mal": "lexique",
  "mal": "lexique",
  "depuis": "lexique",
  "jour": "lexique",
  "hier soir": "lexique",
  "hier": "lexique",
  "jeudi": "lexique",
  "samedi": "lexique",
  "soir": "lexique",
  "où": "lexique",
  "possible": "lexique",
};
