# Artifact viewer

Developer docs for watching an AI-native repo take shape. The site is a VitePress atlas: the requirements, the fork's issues, and embeds for the original files.

https://kvnloo.github.io/artifact-viewer/

```bash
npm install
npm test
npm run dev
```

The requirements were taken from the 13 Sep 2026 CLI brief, the Telegram HITL chat, and the research note at `/workspace/hermes-jobs/artifact-viewer-research.md`. The page that lists them is `docs/guide/requirements.md`. The page that records the search is `docs/guide/search.md`.

A fork imports this repo and points `<IssueBoard repo="owner/fork" />` at its own issues. See `docs/guide/import.md`.
