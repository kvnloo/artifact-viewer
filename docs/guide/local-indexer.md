# Local indexer

`/workspace/artifact-viewer` is the read-only app from the night of the brief. It is not this docs site.

It indexes Hermes `state.db` and allowlisted folders, then serves:

| Page | What it shows |
| --- | --- |
| Lanes | Latest stills for starwars, cardtwin, dream-loop, and the other boards |
| Timeline | One session: user text, thumbnails, `MEDIA:` paths |
| Compare | Two stills |
| Live previews | Ports `9132`–`9145`, up or down, iframe only if up |
| Detail | Path, mime, lane, round, bytes, session |

```bash
cd /workspace/artifact-viewer
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 9188
```

Those previews bind to localhost. This public docs site does not proxy them. It also does not read the private databases.

The indexer does not write back, does not edit `.blend` files, and does not replace Telegram.
