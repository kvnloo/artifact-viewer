# Artifact viewer

A shareable frontend for watching an AI-native repo take shape. One catalog lists the pieces. The shell embeds each piece as what it already is: a page, an image, a video, or a 3D model.

The first published catalog is the Cua RFC 3963 roadmap: overall progress on script-speed computer use, pinned to commit `a959b2a`.

https://kvnloo.github.io/artifact-viewer/?project=cua

## What a fork imports

Leave product `main` aligned with upstream. Import this shell beside the fork, on a docs branch or from the hosted site.

**Hosted module.** On any page served from `https://kvnloo.github.io/…`:

```html
<link rel="stylesheet" href="https://kvnloo.github.io/artifact-viewer/viewer.css">
<div id="artifacts"></div>
<script type="module">
  import { mount } from "https://kvnloo.github.io/artifact-viewer/embed.js";
  mount("#artifacts", { project: "cua" });
  // or a catalog that lives in the fork:
  // mount("#artifacts", { catalog: "/your-fork/artifacts/catalog.json" });
</script>
```

Same-user GitHub Pages share one origin, so a fork can host only `catalog.json` plus the files and point `catalog` at that path.

**Submodule.** For a checkout that should work offline from the network module:

```bash
git submodule add https://github.com/kvnloo/artifact-viewer vendor/artifact-viewer
```

Open `vendor/artifact-viewer/index.html`. Add the fork's own catalog under `projects/<id>/` in this repo, or pass `?catalog=` to a catalog URL.

## Add a project

1. Create `projects/<id>/catalog.json` using `catalog.schema.json`.
2. Put files next to that catalog. `href` values are relative to the catalog file.
3. Append the project to `projects.json`.
4. Push `main`. Pages republishes this repo.

`kind` says what the thing is (`roadmap`, `page`, `still`, `html`, `model`, `video`, `data`). `embed` says how to show it (`page`, `iframe`, `image`, `video`, `model`, `none`). A roadmap carries `progress`, `coverage`, and `steps`. A GLB uses `embed: "model"`. A screenshot uses `embed: "image"`.

## Cua RFC 3963

Catalog: `projects/cua/catalog.json`.

The atlas is a roadmap, not a finished speedup. 120 requirements are mapped. 0 have had acceptance requalified. All 12 packages are still proposed.

`architecture-report.md` and `prior-graph.json` were not in the downloaded atlas. Those two links inside the atlas 404 until the files are added beside `projects/cua/rfcs/3963/index.html`.

## Local indexer

`/workspace/artifact-viewer` is the older localhost app. It reads Hermes sessions and allowlisted folders (starwars, cardtwin, dream-loop captures, live preview ports) and serves them at `http://127.0.0.1:9188`. This repo is the part a fork can import. It does not read those machines.
