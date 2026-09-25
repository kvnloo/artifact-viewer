# Where the words came from

The requirements page only includes a requirement when a store above contained it. This is the search, so the list can be checked.

## Stores

| Store | What it is | What it returned |
| --- | --- | --- |
| Hermes chiefstaff `state.db` | CLI sessions. Full-text table `messages_fts`. | The product brief. Session `20260913_182732_ed8d0b`, user messages `8902` and `8965`, 13 Sep 2026. Phrase `"artifact viewer"` has 137 rows in this database, almost all restatements of that session. |
| Hermes intake `state.db` | Telegram DMs to the gateway, chat `1083429746`, display name kevin. Four telegram sessions. The long one is `20260913_181539_09f81f81`. | The HITL behavior: side-by-side reference vs Blender, "these aren't the vitepress docs", judgments on replied-to images, both workstreams, full-file delivery, nightly Pages URLs, pixel-perfect compare. The words "artifact viewer" are not in that chat. The behavior is. |
| Hermes profile `telegram/state.db` | A second, tiny database. | No matching messages. The Telegram record that matters is intake. |
| Hermes root `state.db` | Merged store. | No copy of the brief. |
| AgentsView `sessions.db` | Cross-agent archive, `messages_fts`. | The same Hermes brief, this repo's later turns, and one unrelated zerOS Control Desk prompt that only shared the word "roadmap". |
| `/workspace/hermes-jobs/artifact-viewer-research.md` | The research pass requested in the CLI brief. Sampled 13 Sep 2026. | Lanes, types, embeds, MVP pages, and the non-goals. |
| `/workspace/artifact-viewer` | The local FastAPI indexer built that night. | Lane board, timeline, compare, live ports, detail. |
| zerOS docs `docs/ops/ARTIFACT-SYSTEM.md` and the VitePress atlas | The docs Kevin pointed at on Telegram ("copy zerOS") and again on 25 Sep 2026. | Docs are the source of truth. A dashboard is a projection. The home page is an atlas, not a landing page. |

## How a message was accepted

1. Full-text search for the phrases `"artifact viewer"`, `"preview website"`, `"directly embed"`, `"repo progresses"`, `"card twin"`.
2. On the Telegram session, a separate pass over user messages under 1,200 characters that were not tool completions. That is where the side-by-side and VitePress lines are.
3. A snippet was not enough. The two CLI messages were read in full from chiefstaff. The Telegram short-text file was read in full.
4. Assistant restatements and compaction summaries were not treated as new requirements.

## What was not found

No earlier Telegram message uses the name "artifact viewer." The named spec starts in the CLI session, and it describes a habit that was already visible in Telegram. Star Wars, cardtwin, Kanto, Charizard, and Pokédex are named as the projects the viewer is for. Their old one-off viewers were not a single written spec in these stores.
