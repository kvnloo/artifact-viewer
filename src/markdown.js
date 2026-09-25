// Block parser for GitHub issue bodies. Text stays text; the Vue layer renders it.

export function roadmapFence(markdown) {
  const lines = String(markdown || "").split("\n");
  let inSection = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^##\s+proposed implementation order/i.test(lines[i])) {
      inSection = true;
      continue;
    }
    if (!inSection) continue;
    if (lines[i].startsWith("## ")) return "";
    if (lines[i].startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      return buf.join("\n").trim();
    }
  }
  return "";
}

export function blocks(markdown) {
  const lines = String(markdown || "").replace(/^#\s+[^\n]+\n+/, "").replaceAll("\r\n", "\n").split("\n");
  const out = [];
  const ids = new Set();
  let i = 0;
  const special = (line) =>
    line.startsWith("```") ||
    /^#{1,4}\s+/.test(line) ||
    line.startsWith("|") ||
    /^\s*([-*]|\d+\.)\s+/.test(line) ||
    line.startsWith(">") ||
    /^(-{3,}|\*{3,})$/.test(line.trim());

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i += 1;
      out.push({ type: "pre", text: buf.join("\n") });
      continue;
    }
    if (/^#{1,4}\s+/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#{1,4}\s+/, "").trim();
      out.push({ type: "h", level, text, id: uniqueId(ids, text) });
      i += 1;
      continue;
    }
    if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      const keep = rows.filter((row) => !/^[\s|:-]+$/.test(row)).map(splitRow);
      if (keep.length) out.push({ type: "table", header: keep[0], rows: keep.slice(1) });
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        i += 1;
      }
      out.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push({ type: "quote", text: buf.join(" ") });
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push({ type: "hr" });
      i += 1;
      continue;
    }
    const buf = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !special(lines[i])) buf.push(lines[i++]);
    out.push({ type: "p", text: buf.join(" ") });
  }
  return out;
}

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function uniqueId(ids, text) {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
  let id = base;
  let n = 2;
  while (ids.has(id)) id = `${base}-${n++}`;
  ids.add(id);
  return id;
}
