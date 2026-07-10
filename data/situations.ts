import fr from "./situations.fr.json";
import ar from "./situations.ar.json";

const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
const situationsData = lang === "ar" ? ar : fr;

export default situationsData;
