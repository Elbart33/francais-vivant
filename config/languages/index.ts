import { frConfig } from "./fr";
import { arConfig } from "./ar";

export interface LanguageConfig {
  siteName: string;
  dir: "ltr" | "rtl";
  lang: "fr" | "ar";
  header: {
    logo:
      | { type: "spark" }
      | { type: "letter"; char: string; bgColor: string };
  };
  coachNote: {
    primary: "fr" | "darija";
    appointButtonLabel: string;
    appointButtonIcon: string;
    appointButtonDir: "rtl" | "ltr";
  };
  situationFlow: {
    notFound: string;
    backHome: string;
    continueBtn: string;
    inputPlaceholder: string;
    analyzeButtonLoading: string;
    analyzeButtonIdle: string;
    savedText: string;
    savingText: string;
    anotherSituationBtn: string;
    correctFeedbackPrefix: string;
    incorrectFeedbackPrefix: string;
    startButtonLabel: string;
    noErrorMessage: string;
    startingPointLabel: string;
    correctionLabel: string;
    improvedLabel: string;
    alreadyNaturalMessage: string;
    toRememberLabel: string;
  };
  branding: {
    pageTitle: string;
    pageDescription: string;
    appleWebAppTitle: string;
    themeColor: string;
    manifestName: string;
    manifestShortName: string;
    manifestDescription: string;
    manifestBgColor: string;
  };
  aiPrompts: {
    default: string;
    geminiPrimary: string;
    geminiFallback: string;
  };
}

const configs: Record<string, LanguageConfig> = {
  fr: frConfig,
  ar: arConfig,
};

export function getLanguageConfig(): LanguageConfig {
  const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
  return configs[lang] || configs.fr;
}
