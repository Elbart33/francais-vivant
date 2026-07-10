import fr from "./idioms.fr.json";
import ar from "./idioms.ar.json";

const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
const idiomsData = lang === "ar" ? ar : fr;

export default idiomsData;
