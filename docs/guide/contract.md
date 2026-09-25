# Contract

The research pass turned the conversations into entities. This page is that model, trimmed to what a fork needs.

## Lane

A product the work belongs to.

`starwars`, `temple-guard`, `pokemon/cardtwin`, `kanto`, `charizard`, `pokedex`, `homebase-pickleball`, `helio-cortex`, `growtwin`, `wizard-chess`, `spatial-canvas`, `hermes-liquid-glass`, `zer0-company`.

A lane is a folder of artifacts, not a new app.

## Artifact

| Field | Meaning |
| --- | --- |
| `type` | `still`, `overlay`, `html_preview`, `landing_html`, `glb`, `blend`, `mp4`, `webm`, `svg`, `gif`, `dream_capture`, `dream_target`, `telegram_intake_photo` |
| `embed` | `image`, `iframe`, `video`, `model`, `file` |
| `lane` | One of the names above |
| `round` | From `r10` in a filename, or a judge note |
| `prompt` | The nearest user message that produced it |
| `score` | From the reply ("7.5", "winner", "FAIL") or a `JUDGE_*.md` |
| `git_sha` | Commit of the file when it lives in a repo |
| `conversation` | Session the path was mentioned in |

`landing_html` and a docs site are different types. Do not label one as the other.

## Embed

| Kind | Shows |
| --- | --- |
| `image` | The still itself |
| `iframe` | An HTML page or a nightly URL |
| `video` | mp4 or webm, with controls |
| `model` | A GLB, with orbit |
| `file` | A link. Used for `.blend` |

## Issue

For a fork, the roadmap is the issue tracker on that fork.

- Tracker on: list that repo's issues.
- Tracker off: list the parent repo's issues opened by the fork owner.
- Tracker just turned on and still empty: say so, and link to the parent issues that were opened earlier.
- Skip pull requests.

An issue whose body contains `## Proposed implementation order` and a fenced block shows that block as the order.
