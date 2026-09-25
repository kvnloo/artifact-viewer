import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./Layout.vue";
import Atlas from "./components/Atlas.vue";
import IssueBoard from "./components/IssueBoard.vue";
import ComparePair from "./components/ComparePair.vue";
import ArtifactFrame from "./components/ArtifactFrame.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("Atlas", Atlas);
    app.component("IssueBoard", IssueBoard);
    app.component("ComparePair", ComparePair);
    app.component("ArtifactFrame", ArtifactFrame);
  },
} satisfies Theme;
