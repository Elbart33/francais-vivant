export const frConfig = {
  siteName: "Français Vivant",
  dir: "ltr" as const,
  lang: "fr" as const,
  header: {
    logo: { type: "spark" as const },
  },
  coachNote: {
    primary: "fr" as const,
    appointButtonLabel: "ورك هنا باش تفهم 😊",
    appointButtonIcon: "💬",
    appointButtonDir: "rtl" as const,
  },
  situationFlow: {
    notFound: "Cette situation n'existe pas (ou plus).",
    backHome: "Retour à l'accueil",
    continueBtn: "Continuer",
    inputPlaceholder: "Écrivez votre réponse ici, comme vous la diriez à l'oral...",
    yourReplyLabel: "Votre réponse",
    analyzeButtonLoading: "Analyse en cours...",
    analyzeButtonIdle: "Voir ma correction",
    savedText: "Progression enregistrée",
    savingText: "Enregistrement...",
    anotherSituationBtn: "Une autre situation",
    correctFeedbackPrefix: "Correct ! La réponse était :",
    incorrectFeedbackPrefix: "La réponse correcte était :",
    startButtonLabel: "Commencer",
    noErrorMessage: "Aucune erreur détectée — votre phrase était déjà correcte.",
    startingPointLabel: "Votre point de départ",
    correctionLabel: "Correction",
    improvedLabel: "Version améliorée",
    alreadyNaturalMessage: "Votre formulation était déjà naturelle.",
    toRememberLabel: "À retenir de cette situation",
    navToday: "Aujourd'hui",
    navReview: "À revoir",
    navProgress: "Mon chemin",
  },
  aiPrompts: {
    default: `Tu es un coach de français discret pour un adulte francophone d'origine marocaine (darija), niveau A2+/B1.

Tu reçois UNE phrase en français, telle que l'utilisateur l'a écrite.

Fais deux passes, dans l'ordre :

1) CORRECTION — corrige UNIQUEMENT les erreurs réelles présentes dans la phrase reçue : grammaire, conjugaison, genre, accords, confusions phonologiques fréquentes chez un locuteur darija (ex: b/p), calques lexicaux du darija/arabe vers le français.

RÈGLES STRICTES, à respecter absolument :
- Ne corrige QUE les mots réellement présents dans la phrase de l'utilisateur. N'invente jamais de mots, n'en supprime aucun sans raison grammaticale claire, et ne remplace jamais un mot par un synonyme si le mot original était déjà correct.
- Si un mot te semble inhabituel mais que le sens reste clair dans le contexte, NE LE CHANGE PAS — laisse-le tel quel plutôt que de le remplacer par un mot différent.
- N'ajoute et ne retire aucune ponctuation à moins qu'elle soit strictement nécessaire à la correction grammaticale (une simple virgule stylistique ne compte PAS comme une erreur à corriger).
- INTERPRÉTATION CHARITABLE : avant de corriger, essaie toujours de comprendre ce que l'utilisateur a voulu dire, même si un mot est mal formé ou dans un registre familier. Si le sens général de la phrase reste compréhensible malgré une erreur, corrige la FORME (orthographe, conjugaison, structure) tout en préservant le SENS et les mots-clés que l'utilisateur a choisis. Ne remplace jamais un mot par un concept différent simplement parce qu'il te semble rare — cherche d'abord à l'interpréter dans le contexte de la phrase avant de le juger incorrect.
- Si la phrase est déjà correcte, ou si tu as un doute sur une correction, "corrected" doit rester identique à la phrase reçue.

2) AMÉLIORATION — à partir de la version corrigée, propose une reformulation plus naturelle, idiomatique, au registre courant poli, sans changer le sens. Si la phrase corrigée est déjà naturelle, "improved" doit être identique à "corrected".

Pour chaque passe où tu as changé la phrase, donne une explication très courte en français (une phrase, simple, jamais de jargon grammatical technique).
Si tu n'as rien changé à une passe, laisse l'explication correspondante vide ("").

Réponds STRICTEMENT en JSON valide, sans texte ni markdown autour, avec exactement ce format:
{"corrected": "...", "correctionChanged": true, "correctionExplanationFr": "...", "improved": "...", "improvementChanged": true, "improvementExplanationFr": "..."}`,
    geminiPrimary: `أنت مدرب دارجة مغربية و فرنسية. خدمتك هي تصحيح الجمل ديال الناس اللي كيتعلموا الفرنسية.

مهمتك، بالترتيب:

1. تحقق من الملاءمة — واش الجملة كتجاوب فعلا على المهمة المطلوبة فالوضعية؟ حدد "isRelevant" (true ولا false). إلا كانت الجملة بعيدة على الموضوع أو ماشي منطقية، دير isRelevant ب false و كتب "relevanceNoteFr" بجملة قصيرة و لطيفة بالفرنسية كتوضح علاش الجواب ماشي مناسب. إلا كانت الجملة مناسبة، دير isRelevant ب true و خلي relevanceNoteFr فارغة.

2. تصحيح الجملة من ناحية القواعد و الصرف و التذكير و التأنيث — غير الأخطاء الحقيقية اللي كاينة فالجملة. ما تخترعش كلمات، ما تبدلش كلمة صحيحة بكلمة أخرى، ما تبدلش حتى حاجة ماشي غلط حقيقي.

3. تحسين الجملة باش تكون أكثر طبيعية فالمحكية (شفهية)، ماشي أكثر رسمية أو مكتوبة، بلا ما تبدل المعنى.

4. تصنيف نوع الغلطة الأساسية اللي صححتيها — حدد "correctionCategory" من هاد اللائحة بالضبط (كلمة وحدة، بالحروف اللاتينية):
   - "genre" (التذكير و التأنيث، مثلا "un information" بدل "une information")
   - "nombre" (المفرد و الجمع)
   - "conjugaison" (تصريف الأفعال)
   - "phonologie" (بحال الخلط بين B و P، ولا حروف كايتبدلو فالنطق)
   - "orthographe" (كتابة الكلمة غالطة بلا ما يكون سبب نحوي)
   - "lexique" (كلمة ماشي مناسبة للمعنى المقصود)
   - "aucune" (إلا ما كانتش شي تصحيح، correctionChanged=false)
   إلا كانت الجملة فيها كثر من نوع وحد ديال الغلط، اختار النوع الأكثر أهمية أو تكرار.

5. شرح مفصل — بالنسبة للتصحيح و للتحسين، عطي شرحين منفصلين (واحد بالدارجة، واحد بالفرنسية) كيعددو كل تغيير دار به بشكل مرقم:
   - كل تغيير مرقم (1., 2., 3., الخ — استعمل \\n باش تفصل السطور فJSON).
   - الكلمة أو مجموعة الكلمات اللي تبدلات تكون بين نجمتين.
   - بعد كل كلمة بين نجمتين، زيد السبب فكلمتين ولا تلاتة، مختصر بزاف.
   - إلا كانت correctionCategory هي "genre" ولا "nombre"، خاص الشرح بالدارجة يوضح بوضوح علاش خاص يكون التذكير/التأنيث ولا المفرد/الجمع صحيح فهاد الحالة بالضبط.
   - إلا كان غير تغيير واحد، نقطة وحدة كافية.
   - إلا ما بدلتيش حاجة فمرحلة، خلي الشرحين ديالها فارغين.
   - ما تهضرش على الملاءمة فهاد الشروحات.

قواعد صارمة على التصحيح:
- فهم أولا شنو بغا يقول المستخدم، حتى إلا كانت الكلمة ماشي مألوفة أو مكتوبة بشكل مختلف. إلا بقا المعنى مفهوم، صحح الشكل بلا ما تبدل المعنى ولا الكلمات الأساسية.
- إلا كانت شي كلمة غريبة عليك ولكن المعنى واضح فالسياق، ما تبدلهاش.
- ما تزيدش ولا تنقصش علامات الترقيم إلا كانت ضرورية للتصحيح النحوي.

قواعد مهمة على التحسين:
- المستوى المستهدف هو فرنسية صحيحة و مزيانة، ماشي رسمية بزاف و ماشي دارجة بزاف. بلاصة وسطى.
- خلي الكلمات اللي دخلات فالاستعمال اليومي كيفما هي، ماشي كل مرة تبدلها بكلمة رسمية.
- إلا كانت الجملة المصححة طبيعية بزاف، خلي "improved" بحال "corrected" بلا تبديل.

الجواب يكون JSON بهذا الشكل بالضبط:
{
  "isRelevant": true,
  "relevanceNoteFr": "",
  "corrected": "...",
  "correctionChanged": true,
  "correctionCategory": "genre",
  "correctionExplanationDarija": "1. **كلمة** — سبب قصير",
  "improved": "...",
  "improvementChanged": true,
  "improvementExplanationDarija": "..."
}

إذا ما بدلتي حاجة فالتصحيح، خلي correctionChanged=false, correctionCategory="aucune" و الشرح فارغ.
إذا ما بدلتي حاجة فالتحسين، خلي improvementChanged=false و الشرح فارغ.`,
    geminiFallback: `أنت مدرب دارجة مغربية و فرونسي. خدمتك هي تصحيح الجمل ديال الناس اللي كيتعلمو الفرنسية.

مهمتك:
1. تحقق من الملاءمة — واش الجملة كتجاوب فعلا على المهمة المطلوبة؟ حدد isRelevant. إلا كانت false، عمر relevanceNoteFr بجملة قصيرة و لطيفة بالفرنسية.
2. تصحيح الجملة من ناحية القواعد و الصرف و التذكير و التأنيث — غير الأخطاء الحقيقية، ما تخترعش كلمات.
3. تحسين الجملة باش تكون أكثر طبيعية فالمحكية (شفهية)، بلا ما تبدل المعنى.
4. صنف الغلطة الأساسية فcorrectionCategory: "genre", "nombre", "conjugaison", "phonologie", "orthographe", "lexique", ولا "aucune".
5. لكل تغيير دار به، زيدو مرقم (1., 2., الخ) فالشرح بالدارجة، مع الكلمة المتغيرة بين نجمتين متبوعة بسبب قصير.

إذا ما بدلتيش حاجة، خلي الشرح فارغ و correctionCategory="aucune".

جاوب فقط بهاد الشكل JSON، بلا أي نص أو markdown حواليه:
{"isRelevant": true, "relevanceNoteFr": "", "corrected": "...", "correctionChanged": true, "correctionCategory": "aucune", "correctionExplanationDarija": "...", "improved": "...", "improvementChanged": true, "improvementExplanationDarija": "..."}`,
  },
  branding: {
    pageTitle: "Français Vivant — parlez un français qui vous ressemble",
    pageDescription: "Une pratique quotidienne pour transformer un français fonctionnel en français naturel, à partir de situations de vie réelles.",
    appleWebAppTitle: "Français Vivant",
    themeColor: "#8B0000",
    manifestName: "Français Vivant",
    manifestShortName: "Fr. Vivant",
    manifestDescription: "Une pratique quotidienne pour transformer un français fonctionnel en français naturel.",
    manifestBgColor: "#F3ECDC",
  },
  reinforcementTips: {
    genre: {
      title: "Le féminin et le masculin",
      tip: "Chaque nom a un genre fixe qu'il faut apprendre avec le mot lui-même. Mémorisez le mot avec son article plutôt que le mot seul.",
      example: "une information (pas un information) / le problème (pas la problème)",
    },
    nombre: {
      title: "Le singulier et le pluriel",
      tip: "Le pluriel s'entend surtout par le déterminant (le, les, un, des), pas toujours par la fin du mot. Écoutez bien le déterminant.",
      example: "le problème devient les problèmes / une information devient des informations",
    },
    conjugaison: {
      title: "La conjugaison des verbes",
      tip: "Chaque personne a sa propre terminaison de verbe. Les verbes les plus utilisés ont des formes irrégulières à mémoriser par coeur.",
      example: "je peux et non je peut / je sais et non je c'est",
    },
    phonologie: {
      title: "Les sons proches comme B et P",
      tip: "Le son P est souvent confondu avec B. P se prononce sans faire vibrer la gorge, B avec vibration.",
      example: "police et non bolice / parking et non barking",
    },
    orthographe: {
      title: "L'orthographe",
      tip: "Certains mots s'écrivent différemment de leur prononciation. Revoyez-les régulièrement à l'écrit.",
      example: "ça va, avec une cédille, et non sa va",
    },
    lexique: {
      title: "Le bon mot pour la bonne idée",
      tip: "Un mot peut exister en français sans s'utiliser dans le même contexte qu'en darija. Apprenez ces expressions telles quelles.",
      example: "chez le médecin, pas au médecin, qui se dit pour un lieu et non une personne",
    },
  },
};
