# Artifact viewer

A page that reads a fork's GitHub issues and shows them as the roadmap.

https://kvnloo.github.io/artifact-viewer/?project=cua

`kvnloo/cua` does not have its own issue tracker. GitHub files that fork's issues on `trycua/cua`. The page loads the issues opened by `kvnloo` there. The script-speed computer-use RFC is #3963, and its proposed order is the strip at the top of the issue.

## Import

```html
<link rel="stylesheet" href="https://kvnloo.github.io/artifact-viewer/viewer.css">
<div id="artifacts"></div>
<script type="module">
  import { mount } from "https://kvnloo.github.io/artifact-viewer/embed.js";
  mount("#artifacts", { project: "cua" });
  // or any fork, with no catalog file:
  // mount("#artifacts", { repo: "kvnloo/cua" });
</script>
```

`projects.json` only names the fork. There is no copied RFC body in this repo.

To add another fork, append `{ "id", "title", "repo" }` to `projects.json`.

A submodule works the same way:

```bash
git submodule add https://github.com/kvnloo/artifact-viewer vendor/artifact-viewer
```

The browser calls the public GitHub API. Unauthenticated calls share a small rate limit per IP.
