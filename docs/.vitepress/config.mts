import { defineConfig } from "vitepress";

const repo = "https://github.com/kvnloo/artifact-viewer";

export default defineConfig({
  lang: "en-US",
  title: "Artifact viewer",
  titleTemplate: ":title | Artifact viewer",
  description: "Developer docs for watching an AI-native repo take shape: issues, pieces, references, and the original file.",
  base: "/artifact-viewer/",
  cleanUrls: true,
  lastUpdated: true,
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === "model-viewer",
      },
    },
  },
  head: [
    ["script", { type: "module", src: "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ["link", {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
    }],
    ["meta", { name: "theme-color", content: "#0c0c0a" }],
  ],
  themeConfig: {
    siteTitle: "Artifact viewer",
    nav: [
      { text: "Atlas", link: "/" },
      { text: "Requirements", link: "/guide/requirements" },
      { text: "Roadmap", link: "/roadmap/" },
      { text: "Viewer", link: "/viewer/lanes" },
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Atlas", link: "/" },
          { text: "Requirements", link: "/guide/requirements" },
          { text: "Where the words came from", link: "/guide/search" },
          { text: "Import into a fork", link: "/guide/import" },
        ],
      },
      {
        text: "Roadmap",
        items: [
          { text: "Fork issues", link: "/roadmap/" },
          { text: "Contract", link: "/guide/contract" },
        ],
      },
      {
        text: "Viewer",
        items: [
          { text: "Lanes", link: "/viewer/lanes" },
          { text: "Compare", link: "/viewer/compare" },
          { text: "Embed the original", link: "/viewer/embed" },
          { text: "Timeline", link: "/viewer/timeline" },
          { text: "Local indexer", link: "/guide/local-indexer" },
        ],
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3], label: "On this page" },
    editLink: { pattern: `${repo}/edit/main/docs/:path`, text: "Edit this page" },
    socialLinks: [{ icon: "github", link: repo }],
    footer: {
      message: "The docs are the map. Issues on the fork are the living roadmap.",
      copyright: "kvnloo",
    },
  },
});
