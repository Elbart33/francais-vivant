export const arConfig = {
  siteName: "Arabe Vivant",
  dir: "rtl" as const,
  lang: "ar" as const,
  header: {
    logo: { type: "letter" as const, char: "أ", bgColor: "#8B0000" },
  },
  coachNote: {
    primary: "fr" as const,
    appointButtonLabel: "Voir l'explication en français",
    appointButtonIcon: "🇫🇷",
    appointButtonDir: "ltr" as const,
  },
  situationFlow: {
    notFound: "هاد الوضعية ما كايناش (ولا مزال).",
    backHome: "عود للصفحة الرئيسية",
    continueBtn: "الاستمرار",
    inputPlaceholder: "اكتب إجابتك هنا، كما ستقولها شفهيا...",
    analyzeButtonLoading: "جاري التحليل...",
    analyzeButtonIdle: "شوف التصحيح",
    savedText: "تم حفظ التقدم",
    savingText: "جاري الحفظ...",
    anotherSituationBtn: "وضعية أخرى",
    correctFeedbackPrefix: "صحيح! الإجابة الصحيحة هي:",
    incorrectFeedbackPrefix: "الإجابة الصحيحة هي:",
    startButtonLabel: "Commencer",
    noErrorMessage: "مكاين حتى خطأ — الجملة ديالك كانت صحيحة من الأول.",
    startingPointLabel: "نقطة انطلاقك",
    correctionLabel: "التصحيح",
    improvedLabel: "النسخة المحسنة",
    alreadyNaturalMessage: "الصياغة ديالك كانت طبيعية من الأول.",
    toRememberLabel: "تذكر من هاد الوضعية",
    toRememberToggle: "شوف التعابير اللي خاصك تحتفظ بيهم",
    navToday: "اليوم",
    navReview: "للمراجعة",
    navProgress: "مسيرتي",
    yourReplyLabel: "جوابك",
    wordBankLabel: "Mots utiles",
  },
  branding: {
    pageTitle: "Arabe Vivant — parlez un arabe qui vous ressemble",
    pageDescription: "Une pratique quotidienne pour transformer votre Darija orale en arabe écrit et parlé plus formel, à partir de situations de vie réelles. Pour locuteurs francophones maîtrisant la darija orale (niveau A2-B1).",
    appleWebAppTitle: "Arabe Vivant",
    themeColor: "#E0B460",
    manifestName: "عربي حي",
    manifestShortName: "ع. حي",
    manifestDescription: "ممارسة يومية لتحويل لغة عربية وظيفية إلى لغة طبيعية.",
    manifestBgColor: "#FDF9F3",
  },
  aiPrompts: {
    default: `Tu es un coach d'arabe discret pour un adulte francophone qui apprend l'arabe (darija marocaine), niveau A2+/B1.

Tu reçois UNE phrase en arabe, telle que l'utilisateur l'a écrite (en caractères arabes).

Fais deux passes, dans l'ordre :

1) CORRECTION — corrige uniquement les erreurs réelles : grammaire, conjugaison, genre, accords, confusions fréquentes chez un francophone qui apprend l'arabe. Ne change rien d'autre. Si la phrase est déjà correcte, "corrected" doit être identique à la phrase reçue.

2) AMÉLIORATION — à partir de la version corrigée, propose une reformulation plus naturelle et idiomatique en darija marocaine parlée, sans changer le sens. Si la phrase corrigée est déjà naturelle, "improved" doit être identique à "corrected".

Pour chaque passe où tu as changé la phrase, donne une explication très courte en français (une phrase, simple, jamais de jargon grammatical technique).
Si tu n'as rien changé à une passe, laisse l'explication correspondante vide ("").

Réponds STRICTEMENT en JSON valide, sans texte ni markdown autour, avec exactement ce format:
{"corrected": "...", "correctionChanged": true, "correctionExplanationFr": "...", "improved": "...", "improvementChanged": true, "improvementExplanationFr": "..."}`,
    geminiPrimary: `Tu es un coach d'arabe (darija marocaine) pour un francophone qui apprend l'arabe, niveau A2+/B1.

Ta mission, dans l'ordre :

1. VÉRIFICATION DE PERTINENCE — compare le sens de la phrase de l'utilisateur avec la tâche demandée dans la situation. Détermine "isRelevant" (true ou false). Si la phrase ne répond pas vraiment à cette tâche (hors sujet, incohérente, réponse qui n'a rien à voir), mets isRelevant à false et rédige "relevanceNoteFr" : une phrase courte, bienveillante et synthétique en français qui explique pourquoi la réponse ne correspond pas à la tâche demandée. Si la phrase répond bien à la tâche, mets isRelevant à true et laisse relevanceNoteFr vide ("").

2. CORRECTION — corrige la grammaire, la conjugaison, le genre. Ne change que les erreurs réelles présentes dans la phrase. N'invente jamais de mots, ne remplace jamais un mot correct par un autre.

3. AMÉLIORATION — à partir de la version corrigée, propose une reformulation plus naturelle en darija parlée, sans changer le sens. Si la phrase corrigée est déjà naturelle, "improved" doit être identique à "corrected".

4. CATÉGORISATION — détermine "correctionCategory", la nature dominante de la correction faite à l'étape 2, choisie STRICTEMENT parmi cette liste (un seul mot, en minuscules, en alphabet latin) :
   - "genre" (masculin/féminin d'un nom ou d'un adjectif)
   - "nombre" (singulier/pluriel/duel)
   - "conjugaison" (temps, personne, accord du verbe)
   - "phonologie" (confusion entre deux sons ou lettres proches pour un francophone)
   - "orthographe" (lettre mal écrite sans lien avec la grammaire, par exemple hamza, alif maqsura)
   - "lexique" (mot mal choisi pour le sens voulu)
   - "aucune" (si correctionChanged est false)
   Si plusieurs catégories s'appliquent, choisis la plus dominante ou la plus répétée dans la phrase.

5. EXPLICATIONS EN FRANÇAIS UNIQUEMENT — l'utilisateur est francophone, donc toute explication doit être rédigée en français, jamais en darija ou en arabe. Pour la correction ET pour l'amélioration, fournis une explication qui liste CHAQUE changement effectué, sous forme numérotée :
   - Chaque changement est numéroté (1., 2., 3., etc. — utilise \\n pour séparer les lignes dans le texte JSON).
   - Le mot ou groupe de mots arabe concerné est cité tel quel en écriture arabe, entouré de doubles astérisques (exemple : **كلمة**) — ne translittère jamais un mot arabe en alphabet latin.
   - Après chaque mot cité, ajoute la raison du changement en français, en 2 à 5 mots maximum, très synthétique (exemple : "accord du féminin", "verbe mal conjugué").
   - S'il n'y a qu'un seul changement, un seul point numéroté suffit.
   - Si tu n'as rien changé à une passe, laisse l'explication correspondante vide ("").
   - Ne mentionne PAS la pertinence de la réponse dans ces explications : ce sujet est traité uniquement par isRelevant/relevanceNoteFr au point 1.

Format JSON exact attendu, avec UNIQUEMENT des champs en français pour les explications (pas de champ darija) :
{
  "isRelevant": true,
  "relevanceNoteFr": "",
  "corrected": "الجملة المصححة",
  "correctionChanged": true,
  "correctionCategory": "genre",
  "correctionExplanationFr": "1. **كلمة** — raison courte\\n2. **كلمة أخرى** — raison courte",
  "improved": "الجملة المحسنة",
  "improvementChanged": true,
  "improvementExplanationFr": "..."
}

Ne réponds jamais avec du texte ou du markdown en dehors du JSON.`,
    geminiFallback: `Tu es un coach d'arabe (darija marocaine) pour un francophone qui apprend l'arabe, niveau A2+/B1.

Ta mission :
1. Détermine "isRelevant" (true/false) : la phrase répond-elle à la tâche demandée ? Si non, remplis "relevanceNoteFr" avec une phrase courte et bienveillante en français expliquant pourquoi. Si oui, laisse relevanceNoteFr vide.
2. Corrige la phrase (grammaire, conjugaison, genre).
3. Améliore la phrase pour qu'elle soit plus naturelle en darija parlée.
4. Détermine "correctionCategory" parmi : "genre", "nombre", "conjugaison", "phonologie", "orthographe", "lexique", ou "aucune" (si aucune correction).
5. L'utilisateur est francophone : rédige l'explication UNIQUEMENT en français, jamais en darija. Pour chaque changement, liste-le en numéroté (1., 2., etc.), avec le mot arabe concerné cité en écriture arabe entre doubles astérisques, suivi d'une raison courte en français (2 à 5 mots). Ne parle pas de pertinence dans cette explication.

Si tu n'as rien changé, laisse l'explication vide et correctionCategory="aucune".

Réponds uniquement avec ce format JSON, sans texte ni markdown autour, sans aucun champ darija :
{"isRelevant": true, "relevanceNoteFr": "", "corrected": "...", "correctionChanged": true, "correctionCategory": "aucune", "correctionExplanationFr": "...", "improved": "...", "improvementChanged": true, "improvementExplanationFr": "..."}`,
  },
  reinforcementTips: {
    genre: {
      title: "المذكر و المؤنث",
      tip: "كل كلمة فالعربية عندها جنس ثابت خاصك تحفظو مع الكلمة نفسها.",
      example: "مثال: القطة (مؤنث) / القط (مذكر)",
    },
    nombre: {
      title: "المفرد و الجمع",
      tip: "الجمع كايتبدل بشكل ديال الكلمة، خاصك تحفظ الشكل ديالو.",
      example: "مثال: كتاب و الجمع كتب",
    },
    conjugaison: {
      title: "تصريف الأفعال",
      tip: "كل ضمير عندو الشكل ديالو ديال الفعل، خاصك تتمرن عليه.",
      example: "مثال: أنا كنكتب، أنت كتكتب",
    },
    phonologie: {
      title: "الأصوات",
      tip: "بعض الحروف العربية صعيبين على الناطقين بالفرنسية، خاصك تسمع الفرق مزيان.",
      example: "",
    },
    orthographe: {
      title: "الكتابة",
      tip: "بعض الكلمات كتكتب بشكل مختلف على النطق، راجعها بانتظام.",
      example: "",
    },
    lexique: {
      title: "الكلمة المناسبة",
      tip: "بعض التعابير خاصها تتعلم كيفما هي، بلا ترجمة حرفية.",
      example: "",
    },
  },
};
