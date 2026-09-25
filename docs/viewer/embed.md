# Embed the original

A landing page, a component, an animation, and a 3D model are not the same kind of preview. Each one is shown as itself.

| You have | Use |
| --- | --- |
| PNG, JPG, WEBP, GIF, SVG | `kind="image"` |
| HTML page, nightly site, component preview | `kind="iframe"` |
| MP4, WEBM | `kind="video"` |
| GLB | `kind="model"` |
| Blend, or anything the browser should not pretend to open | `kind="file"` |

```md
<ArtifactFrame kind="iframe" src="https://kvnloo.github.io/quackles/nightly/" title="Quackles nightly" />
```

<ArtifactFrame kind="file" src="https://github.com/kvnloo/artifact-viewer" title="This repository" />

A docs page and a landing page both use `iframe` when they are artifacts inside a lane. They are not interchangeable as the viewer's own shell. This site is the docs.
