import fr from "./corrections.fr.json";
import ar from "./corrections.ar.json";

const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
const correctionsData = lang === "ar" ? ar : fr;

export default correctionsData;
