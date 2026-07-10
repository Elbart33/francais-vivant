import { MetadataRoute } from "next";
import { getLanguageConfig } from "@/config/languages";

export default function manifest(): MetadataRoute.Manifest {
  const config = getLanguageConfig();
  return {
    name: config.branding.manifestName,
    short_name: config.branding.manifestShortName,
    description: config.branding.manifestDescription,
    start_url: "/",
    display: "standalone",
    background_color: config.branding.manifestBgColor,
    theme_color: config.branding.themeColor,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
