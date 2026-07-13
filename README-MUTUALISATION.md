# Architecture mutualisee - Francais Vivant / Arabe Vivant

## Principe general

Un seul repo GitHub (francais-vivant, nom historique) heberge le code des deux applications. Deux sites Cloudflare Pages distincts pointent sur ce meme repo, et se differencient uniquement par une variable d'environnement.

Site Francais Vivant : francais-vivant.pages.dev - variable NEXT_PUBLIC_APP_LANG non definie (defaut fr)
Site Arabe Vivant : arabe-vivant.pages.dev - variable NEXT_PUBLIC_APP_LANG=ar

Le repo Darija-Vivant (ancien) est archive sur GitHub et son projet Cloudflare associe a ete supprime ou desactive. Il ne doit plus etre modifie, tout le developpement se fait desormais ici, dans francais-vivant.

## Ou se trouve quoi

config/languages/fr.ts : textes d'interface, prompts IA, branding (titre, couleur, logo) pour le francais
config/languages/ar.ts : equivalent pour l'arabe
config/languages/index.ts : getLanguageConfig lit NEXT_PUBLIC_APP_LANG et renvoie la bonne config

data/situations.fr.json et data/situations.ar.json, plus data/situations.ts qui sert de loader
data/corrections.fr.json et data/corrections.ar.json, plus data/corrections.ts
data/errors.fr.json et data/errors.ar.json, plus data/errors.ts
data/idioms.fr.json et data/idioms.ar.json, plus data/idioms.ts
Chaque loader .ts choisit automatiquement le bon fichier JSON selon la langue.

public/favicon-32.fr.png et public/favicon-32.ar.png, meme logique pour les autres icones.
scripts/select-icons.js copie le bon jeu vers les noms generiques juste avant chaque build, via le hook prebuild defini dans package.json.

app/api/ai/route.ts : logique commune, pioche les prompts dans config/languages
components/, lib/, hooks/ : code partage entre les deux langues

## Regles pour toute modification future

1. Bug ou amelioration technique (composants, logique de fallback IA Gemini vers Groq, timeout, parsing JSON) : modifier un seul fichier partage. Les deux sites en beneficient automatiquement au prochain deploiement.

2. Contenu pedagogique (idiomes, situations, erreurs types, corrections) : modifier uniquement le fichier .fr.json ou .ar.json concerne dans data/. Ne jamais melanger le contenu des deux langues dans un meme fichier.

3. Textes d'interface ou prompts IA propres a une langue : modifier config/languages/fr.ts ou config/languages/ar.ts selon le cas.

4. Avant tout push : toujours lancer npm run build en local pour reperer les erreurs de compilation avant que Cloudflare ne les rencontre en production.

5. Deploiement : un seul git push sur main declenche automatiquement un rebuild sur les deux sites Cloudflare Pages en simultane.

## Piege connu - edition de texte long en terminal

Ne jamais coller un long bloc de texte, surtout contenant de l'arabe, des guillemets, ou des doubles asterisques, directement dans nano. Le collage peut tronquer une ligne en plein milieu et casser la compilation. Preferer l'ecriture de fichier via un bloc cat suivi d'un marqueur de fin unique, colle en une seule fois dans le terminal.

## Variables d'environnement Cloudflare a repliquer sur les deux projets

AI_PROVIDER=gemini
GEMINI_API_KEY=...
GROQ_API_KEY=...
NEXT_PUBLIC_APP_LANG absent ou fr pour le site francais, ar pour le site arabe
