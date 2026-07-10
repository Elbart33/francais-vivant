import fr from "./lexique.fr.json";
import ar from "./lexique.ar.json";

const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
const lexiqueData = lang === "ar" ? ar : fr;

export default lexiqueData;
