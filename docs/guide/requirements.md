# Requirements

This is the full list gathered from the conversations, not a new brief. Each item names where it was said. Status is what this repo does with it today.

The product sentence, from the CLI on 13 Sep 2026:

> An artifact viewer to understand how a repo progresses. A preview for people using AI-native setups. It shows git history, artifact history, prompts, and learnings, so someone else can follow the work.

Dream-loop is a different product. This repo does not absorb it.

## 1. Purpose

| # | Requirement | Source | Here |
| --- | --- | --- | --- |
| 1 | Show how a repository progresses, not a gallery of finished files. | CLI `20260913_182732_ed8d0b` | Roadmap page reads the fork's issues. The docs are the map around them. |
| 2 | Support the loop where a design or an image is wrong and the next round has to be judged. | Same CLI turn; Telegram judgments ("wowowow so much better", "this is the oldest version") | Compare page. Issue comments stay on GitHub; the body is the decision text. |
| 3 | Work across the real projects: Star Wars, Pokémon cardtwin, Kanto, Charizard, Pokédex, Homebase, Helio, GrowTwin. | CLI turn; later fork conversation 25 Sep 2026; research brief lanes | [Lanes](/viewer/lanes). |
| 4 | Be a guide other people can follow, including prompts and learnings. | CLI turn | These docs. Learnings that are still only in chat are not invented here. |
| 5 | Stay separate from dream-loop. | CLI turn the same night: "do them in parallel" | Named as a non-goal below. |
| 6 | Be something a fork can import. | This repo's own request, 25 Sep 2026 | [Import](/guide/import). |
| 7 | Be the developer docs and the roadmap, not a marketing landing page. | Telegram 14 Sep 2026, "these aren't even the vitepress docs they're a landing page"; 25 Sep 2026, use the zerOS docs as the kit | This VitePress atlas. |

## 2. What an artifact is

Said in the CLI, then pinned down by the research pass over Telegram and the filesystem.

| # | Requirement | Source | Here |
| --- | --- | --- | --- |
| 8 | One artifact might be a full landing page, a component, an animation, or a 3D model. | CLI `20260913_182732_ed8d0b` | [Embed](/viewer/embed). |
| 9 | Embed the object's original type. A page is a page. A GLB is a model. A still is an image. | Same turn | `ArtifactFrame` kinds: `image`, `iframe`, `video`, `model`, `file`. |
| 10 | Types to recognize: still, overlay, html preview, landing html, glb, blend, mp4, webm, svg, gif, dream capture, dream target, telegram photo. | Research brief, 13 Sep 2026 | [Contract](/guide/contract). |
| 11 | A `.blend` is linked, not edited in the browser. | Research brief non-goal | `kind="file"`. |
| 12 | A VitePress site and a landing page are different artifacts and must not be substituted for each other. | Telegram 14 Sep 2026, replying to a screenshot of the wrong surface | The atlas home is docs. A landing page would be an iframe artifact inside a lane. |
| 13 | A nightly or GitHub Pages URL is itself an artifact. | Telegram 17 Sep 2026, quackles nightly | An iframe embed of that URL. |
| 14 | Pieces accumulate until the whole page exists. The viewer is the cumulation of the conversation, not a single export. | CLI turn | Timeline page. Issues are the public cumulation. |

## 3. How you look

| # | Requirement | Source | Here |
| --- | --- | --- | --- |
| 15 | Lane board. Filter by product. Latest stills and type chips. | Research brief MVP | [Lanes](/viewer/lanes) names the lanes. Stills appear when a fork passes image URLs. This site does not scrape private disks. |
| 16 | Timeline of one conversation: the words, the thumbnails, the MEDIA lines, a preview iframe when a port is known. | Research brief MVP | [Timeline](/viewer/timeline). The local indexer still does the private sqlite pass. |
| 17 | Compare two stills. Target versus capture. Optional overlay. | Research brief; Telegram 13 Sep 2026: "I can't tell which is reference and which is blender, show a side by side" | [Compare](/viewer/compare). Captions are required. |
| 18 | Pixel-perfect check: the live shot next to the reference. | Telegram 16 Sep 2026, quackles scroll spec | Same compare component. |
| 19 | Live HTML previews on the local ports, with health. | Research brief, ports 9132–9145 | Documented on the local indexer page. Those ports are localhost-only. |
| 20 | Detail: path, mime, session, git sha, round, score. | Research brief MVP | Contract fields. Shown when the local indexer is running. |
| 21 | Both workstreams at once. | Telegram 14 Sep 2026: "can I keep getting images from both work streams?" | Two lanes, not one mixed feed. |
| 22 | Judgment stays attached to the image. | Telegram replies on `file_298.jpg` and others | A compare or lane card has a caption. Scores parsed from text are a local-indexer job. |
| 23 | Send the full file when a preview is too small. | Telegram 17 Sep 2026 | The embed uses the file URL, not a chat thumbnail. |

## 4. Where the data lives

| # | Requirement | Source | Here |
| --- | --- | --- | --- |
| 24 | Learn the parameters from Telegram and session history before inventing a schema. | CLI turn: "look thru ALL telegram messages & sessions" | Done in the 13 Sep research brief. [Search](/guide/search) records the stores. |
| 25 | Variables: type, parent conversation, git commit, prompt, score, round, lane, surface, mime, embed. | Research brief | [Contract](/guide/contract). |
| 26 | Scores live in language ("bakeoff astra 7.5 winner", "FAIL") and in `JUDGE_*.md`, not in a column. | Research brief, sampled Telegram | Local indexer. Not re-parsed in the browser. |
| 27 | The living roadmap for a fork is that fork's GitHub issues. | 25 Sep 2026, after the frozen catalog | [Roadmap](/roadmap/). |
| 28 | If the fork's issue tracker is off, read the parent's issues opened by the fork owner. | Same day, `kvnloo/cua` had `has_issues: false` | `IssueBoard` does this. |
| 29 | If the tracker is turned on later, read the fork. Older issues stay on the parent until someone opens them there. | 25 Sep 2026, tracker enabled, list empty | Empty state links to the parent search. |
| 30 | Pull requests are not issues. | The issue list API mixes them in | Filtered out. |
| 31 | Docs are the human source of truth. A dashboard is a projection. | zerOS `docs/ops/ARTIFACT-SYSTEM.md`, and the request to use that docs kit | This site is the docs. It does not keep a second copied RFC body. |

## 5. Design bar

| # | Requirement | Source | Here |
| --- | --- | --- | --- |
| 32 | Document the process with the same fidelity as the zerOS developer docs. "If you look at zerOS just copy that for the design docs." | Telegram 14 Sep 2026 | VitePress atlas, sidebar, local search, editorial type. The private zerOS token package is not vendored. |
| 33 | High quality first, then something another person or a cheaper model can follow. | CLI turn, the "S+" bar, said about dream-loop and applied here as the drop-in test | [Import](/guide/import). |
| 34 | Do not replace Telegram or the Hermes gateway. | Research brief non-goal | The local indexer is read-only. |
| 35 | Do not pour raw tool-result blobs into a model to build the viewer. | Research brief non-goal | Search used FTS and short user texts. |
| 36 | Do not treat Cursor canvases or an empty kanban attachment table as the ledger. | zerOS artifact system; research brief | Issues + these docs. |

## Non-goals

- Generating new images or 3D from this site.
- Editing `.blend` files in the page.
- Indexing all of `/workspace`.
- Merging dream-loop into this repo.
- Pretending a landing page is these docs.
