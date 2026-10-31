import type { MetadataRoute } from "next";

// Installable-app manifest — same app-readiness layer as thedjcares.com,
// stepinthering.com, and idontcry.com.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PleaseBeReady",
    short_name: "PleaseBeReady",
    description:
      "Shopping lists for whatever is coming: kits with amounts for your group, Amazon links, and lists saved on your device.",
    start_url: "/",
    shortcuts: [
      { name: "My Ready Lists", short_name: "Lists", url: "/lists" },
      { name: "Kits", short_name: "Kits", url: "/kits" },
    ],
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [
      { src: "/icons/pbr-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/pbr-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/pbr-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/pbr-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
