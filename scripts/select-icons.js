const fs = require("fs");
const path = require("path");

const lang = process.env.NEXT_PUBLIC_APP_LANG || "fr";
const publicDir = path.join(__dirname, "..", "public");

const files = ["favicon-32.png", "apple-touch-icon-180.png", "icon-192.png", "logo-512.png"];

files.forEach((file) => {
  const source = path.join(publicDir, file.replace(".png", `.${lang}.png`));
  const dest = path.join(publicDir, file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`Copied ${source} -> ${dest}`);
  } else {
    console.warn(`Missing icon variant: ${source}`);
  }
});
