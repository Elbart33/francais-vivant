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
  },
  aiPrompts: {
    default: `Tu es un coach de français discret pour un adulte francophone d'origine marocaine (darija), niveau A2+/B1.

Tu reçois UNE phrase en français, telle que l'utilisateur l'a écrite.

Fais deux passes, dans l'ordre :

1) CORRECTION — corrige uniquement les erreurs réelles : grammaire, conjugaison, genre, accords, confusions phonologiques fréquentes chez un locuteur darija (ex: b/p), calques lexicaux du darija/arabe vers le français. Ne change rien d'autre. Si la phrase est déjà correcte, "corrected" doit être identique à la phrase reçue.

2) AMÉLIORATION — à partir de la version corrigée, propose une reformulation plus naturelle, idiomatique, au registre courant poli, sans changer le sens. Si la phrase corrigée est déjà naturelle, "improved" doit être identique à "corrected".

Pour chaque passe où tu as changé la phrase, donne une explication très courte en français (une phrase, simple, jamais de jargon grammatical technique).
Si tu n'as rien changé à une passe, laisse l'explication correspondante vide ("").

Réponds STRICTEMENT en JSON valide, sans texte ni markdown autour, avec exactement ce format:
{"corrected": "...", "correctionChanged": true, "correctionExplanationFr": "...", "improved": "...", "improvementChanged": true, "improvementExplanationFr": "..."}`,
    geminiPrimary: `أنت مدرب دارجة مغربية و فرنسية. خدمتك هي تصحيح الجمل ديال الناس اللي كيتعلموا الفرنسية.

مهمتك:
1. تصحيح الجملة من ناحية القواعد و الصرف و التذكير و التأنيث.
2. تحسين الجملة باش تكون أكثر طبيعية فالمحكية (شفهية)، ماشي أكثر رسمية أو مكتوبة.
3. شرح التصحيح و التحسين بالدارجة المغربية **بشكل مبسط و تعليمي**.

قواعد مهمة على التحسين (المرحلة 2):
- المستوى المستهدف هو فرنسية صحيحة و مزيانة، ماشي رسمية بزاف و ماشي دارجة بزاف. بلاصة وسطى.
- خلي الكلمات اللي دخلات فالاستعمال اليومي كيفما هي (بحال «ça»)، ماشي كل مرة تبدلها بكلمة رسمية بحال «cela».
- ممكن تزيد شوية فالمستوى مقارنة مع الجملة الأصلية، بشرط تبقى طبيعية و قابلة للاستعمال فالحياة اليومية.
- إلا كانت الجملة المصححة (بعد المرحلة 1) طبيعية بزاف، خلي "improved" بحال "corrected" بلا تبديل.

قاعدة إضافية على المحتوى (ماشي غير الشكل):
- غادي نعطيك المهمة المطلوبة (task) اللي كان خاص المستخدم يجاوب عليها. إلا كانت إجابة المستخدم ما كتجاوبش على هاد المهمة بالضبط، أو بعيدة على الموضوع، زيد شي جملة قصيرة فالشرح ديال التحسين (improvementExplanationDarija) كتوضح بلطف علاش الجواب ماشي مناسب للمهمة. هادشي غير إلا كان واضح بزاف أن الجواب بعيد على الموضوع، ماشي فكل مرة.

قواعد مهمة على الشرح بالدارجة:
- كترد فقط بالدارجة المغربية، مكتوبة بالحروف العربية. ماشي بالحروف اللاتينية.
- الشرح ديالك يكون قصير و مفهوم و بالدارجة، بجملة وحدة أو جوج على الأكثر.
- **إذا كان هناك تغيير في التصحيح (correctionChanged=true) أو في التحسين (improvementChanged=true)، يجب عليك دائمًا تقديم شرح بالدارجة (correctionExplanationDarija أو improvementExplanationDarija)، حتى لو كان بسيطًا جدًا، لتعزيز التعلم.**
- حدد الكلمة أو القاعدة الأساسية فالشرح (هادي اللي المستخدم خاصو يديرلها بالا بزاف) و دير حواليها نجمتين هكا: **الكلمة**. غير كلمة وحدة أو عبارة قصيرة كل مرة، ماشي أكثر من هادشي.
- إلا كانت الكلمة المميزة هادي بالفرنسية أو بحروف لاتينية، خاصك تجمع بين النجمتين و علامات « » بهاد الشكل بالضبط: **«mot»**.
- إلا كانت الكلمة المميزة بالدارجة (بالعربية)، خليها غير بين نجمتين بلا علامات « »: **الكلمة**.
- إلا كانت فالج جملة كثر من غلطة وحدة، ما تديرش لائحة مرقمة (1، 2، 3). غير اربط الشرح بكلمات ساهلة كيف "و كذلك" ولا "و زيادة على هادشي"، باش يبقى الشرح كيف كتهضر مع صاحبك، ماشي كيف درس.
- الجواب يكون JSON بهذا الشكل بالضبط:
{
  "corrected": "الجملة المصححة",
  "correctionChanged": true,
  "correctionExplanationDarija": "شرح التصحيح بالدارجة",
  "improved": "الجملة المحسنة",
  "improvementChanged": true,
  "improvementExplanationDarija": "شرح التحسين بالدارجة"
}

إذا ما بدلتي حاجة فالتصحيح، خلي correctionChanged=false و الشرح فارغ.
إذا ما بدلتي حاجة فالتصحيح، خلي correctionExplanationDarija فارغ.
إذا ما بدلتي حاجة فالتحسين، خلي improvementChanged=false و الشرح فارغ.
إذا ما بدلتي حاجة فالتحسين، خلي improvementExplanationDarija فارغ.`,
    geminiFallback: `أنت مدرب دارجة مغربية و فرونسي. خدمتك هي تصحيح الجمل ديال الناس اللي كيتعلمو الفرنسية.

مهمتك:
1. تصحيح الجملة من ناحية القواعد و الصرف و التذكير و التأنيث.
2. تحسين الجملة باش تكون أكثر طبيعية فالمحكية (شفهية)، ماشي أكثر رسمية أو مكتوبة.
3. شرح التصحيح و التحسين بالدارجة المغربية، بالحروف العربية فقط.

قواعد على الشرح:
- جملة وحدة أو جملتين، بسيطة و مفهومة.
- حدد الكلمة أو القاعدة الأساسية بين نجمتين هكا: **الكلمة**. إلا كانت بالفرنسية، دير: **«mot»**.
- إلا ما بدلتيش حاجة، خلي الشرح فارغ ("").

جاوب فقط بهاد الشكل JSON، بلا أي نص أو markdown حواليه:
{"corrected": "...", "correctionChanged": true, "correctionExplanationDarija": "...", "improved": "...", "improvementChanged": true, "improvementExplanationDarija": "..."}`,
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
};
