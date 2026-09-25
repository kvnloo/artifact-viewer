# Import into a fork

Leave the product's `main` aligned with upstream. Use this repo as the docs beside the fork.

```bash
git submodule add https://github.com/kvnloo/artifact-viewer vendor/artifact-viewer
cd vendor/artifact-viewer
npm install
npm run dev
```

The roadmap page reads one repo:

```md
<IssueBoard repo="owner/fork" />
```

If that fork has issues disabled, the component reads issues the fork owner opened on the parent. If the tracker is enabled, it reads the fork.

A page, a still, a clip, or a model is an embed, not a new docs theme:

```md
<ArtifactFrame kind="iframe" src="https://example.com/nightly/" title="Nightly" />
<ArtifactFrame kind="model" src="/models/card.glb" title="Card" />
<ComparePair left="/ref.png" right="/render.png" left-label="Reference" right-label="Blender" />
```

`left-label` and `right-label` are required in spirit. An unlabeled pair is how a reference and a render get swapped.

Build with `npm run build`. GitHub Pages for this repo uses `.github/workflows/pages.yml` and publishes `docs/.vitepress/dist` at `/artifact-viewer/`.
