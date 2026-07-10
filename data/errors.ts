import fr from "./errors.fr.json";
import ar from "./errors.ar.json";

const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
const errorsData = lang === "ar" ? ar : fr;

export default errorsData;
