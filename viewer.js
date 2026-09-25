const VIEWER_BASE = new URL(".", import.meta.url);
const GITHUB = "https://api.github.com";

export async function mount(target, options = {}) {
  const root = typeof target === "string" ? document.querySelector(target) : target;
  if (!root) throw new Error("artifact viewer mount target missing");
  const params = new URLSearchParams(location.search);
  const state = {
    root,
    options,
    projects: [],
    project: null,
    source: null,
    issues: [],
    issueNumber: Number(options.issue || params.get("issue")) || null,
  };
  root.replaceChildren(shell());
  try {
    const directRepo = options.repo || params.get("repo");
    if (directRepo) {
      await openRepo(state, { id: directRepo, title: directRepo, repo: directRepo });
    } else {
      const index = await loadJson(new URL("projects.json", VIEWER_BASE));
      state.projects = index.projects || [];
      const wanted = options.project || params.get("project");
      const chosen = state.projects.find((p) => p.id === wanted) || (state.projects.length === 1 ? state.projects[0] : null);
      if (chosen) await openRepo(state, chosen);
      else renderChooser(state);
    }
  } catch (err) {
    state.root.querySelector("main").replaceChildren(note(err.message));
  }
  return state;
}

function shell() {
  const header = document.createElement("header");
  const title = document.createElement("h1");
  const home = document.createElement("button");
  home.type = "button";
  home.dataset.action = "home";
  home.textContent = "Artifact viewer";
  title.append(home);
  header.append(title);
  const main = document.createElement("main");
  const wrap = document.createElement("div");
  wrap.append(header, main);
  wrap.addEventListener("click", (event) => {
    const st = event.currentTarget.__state;
    if (!st) return;
    const homeBtn = event.target.closest("[data-action='home']");
    const issueBtn = event.target.closest("[data-issue]");
    if (homeBtn) {
      history.replaceState(null, "", location.pathname);
      renderChooser(st);
    } else if (issueBtn) {
      st.issueNumber = Number(issueBtn.dataset.issue);
      remember(st);
      paint(st);
    }
  });
  return wrap;
}

async function openRepo(state, project) {
  state.project = project;
  const meta = await github(`/repos/${project.repo}`);
  const owner = meta.owner.login;
  if (meta.has_issues) {
    state.source = { repo: project.repo, mode: "repo", owner, fork: project.repo };
    state.issues = await listIssues(project.repo, null);
  } else if (meta.parent?.full_name) {
    state.source = { repo: meta.parent.full_name, mode: "parent", owner, fork: project.repo };
    state.issues = await listIssues(meta.parent.full_name, owner);
  } else {
    state.source = { repo: project.repo, mode: "repo", owner, fork: project.repo };
    state.issues = await listIssues(project.repo, null);
  }
  state.issues.sort((a, b) => score(b) - score(a) || Date.parse(b.updated_at) - Date.parse(a.updated_at));
  if (!state.issues.some((issue) => issue.number === state.issueNumber)) {
    const rfc = state.issues.find((issue) => /rfc/i.test(issue.title));
    state.issueNumber = (rfc || state.issues[0])?.number || null;
  }
  remember(state);
  const wrap = state.root.firstElementChild;
  wrap.__state = state;
  paint(state);
}

function score(issue) {
  return /rfc/i.test(issue.title) ? 1 : 0;
}

async function listIssues(repo, creator) {
  const issues = [];
  for (let page = 1; page <= 5; page += 1) {
    const query = new URLSearchParams({ state: "all", per_page: "100", page: String(page), sort: "updated", direction: "desc" });
    if (creator) query.set("creator", creator);
    const batch = await github(`/repos/${repo}/issues?${query}`);
    issues.push(...batch.filter((item) => !item.pull_request));
    if (batch.length < 100) break;
  }
  return issues;
}

function paint(state) {
  const wrap = state.root.firstElementChild;
  wrap.__state = state;
  const main = wrap.querySelector("main");
  const layout = document.createElement("div");
  layout.className = "layout";
  layout.append(issueList(state), issueArticle(state));
  main.replaceChildren(layout);
}

function issueList(state) {
  const aside = document.createElement("aside");
  aside.className = "issue-list";
  aside.append(sourceLine(state));
  if (!state.issues.length) {
    aside.append(note("No issues yet."));
    return aside;
  }
  for (const issue of state.issues) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "issue";
    button.dataset.issue = String(issue.number);
    if (issue.number === state.issueNumber) button.classList.add("on");
    const pill = document.createElement("span");
    pill.className = `status ${issue.state}`;
    pill.textContent = issue.state;
    const title = document.createElement("strong");
    title.textContent = issue.title;
    const meta = document.createElement("span");
    meta.className = "muted";
    meta.textContent = `#${issue.number} · ${when(issue.updated_at)}`;
    button.append(pill, title, meta);
    aside.append(button);
  }
  return aside;
}

function sourceLine(state) {
  const line = document.createElement("p");
  line.className = "muted source-line";
  if (state.source.mode === "parent") {
    line.textContent = `${state.source.fork} files issues on ${state.source.repo}. Showing the ones opened by ${state.source.owner}.`;
  } else {
    line.textContent = `Issues on ${state.source.repo}.`;
  }
  return line;
}

function issueArticle(state) {
  const article = document.createElement("article");
  const issue = state.issues.find((item) => item.number === state.issueNumber);
  if (!issue) {
    article.append(note("Pick an issue."));
    return article;
  }
  const kicker = document.createElement("div");
  kicker.className = "kicker";
  kicker.textContent = `${state.project.title} · #${issue.number}`;
  const title = document.createElement("h2");
  title.className = "title";
  title.textContent = issue.title;
  article.append(kicker, title, actions(state, issue));
  const roadmap = roadmapBlock(issue.body || "");
  if (roadmap) {
    const label = document.createElement("div");
    label.className = "kicker";
    label.textContent = "Proposed order";
    const pre = document.createElement("pre");
    pre.className = "roadmap";
    pre.textContent = roadmap;
    article.append(label, pre);
  }
  const body = (issue.body || "").replace(/^#\s+[^\n]+\n+/, "");
  article.append(renderMarkdown(body, state.source.repo));
  return article;
}

function actions(state, issue) {
  const row = document.createElement("div");
  row.className = "actions";
  const open = document.createElement("a");
  open.className = "btn primary";
  open.href = issue.html_url;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "Open on GitHub";
  const fork = document.createElement("a");
  fork.className = "btn";
  fork.href = `https://github.com/${state.source.fork}`;
  fork.target = "_blank";
  fork.rel = "noopener noreferrer";
  fork.textContent = state.source.fork;
  row.append(open, fork);
  return row;
}

function renderChooser(state) {
  const main = state.root.querySelector("main");
  const box = document.createElement("div");
  box.className = "projects";
  const intro = document.createElement("div");
  intro.append(el("div", "kicker", "Forks"), el("h2", "title", "Issues from the fork."), note("Each project names a fork. The page reads that fork's issues from GitHub."));
  main.replaceChildren(intro, box);
  for (const project of state.projects) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project";
    button.append(el("div", "kicker", project.repo), el("h3", "", project.title));
    button.onclick = async () => {
      try {
        await openRepo(state, project);
      } catch (err) {
        main.replaceChildren(note(err.message));
      }
    };
    box.append(button);
  }
}

function roadmapBlock(body) {
  const lines = body.split("\n");
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

function renderMarkdown(markdown, repo) {
  const root = document.createElement("div");
  root.className = "prose";
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const ids = new Set();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i += 1;
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = buf.join("\n");
      pre.append(code);
      root.append(pre);
      continue;
    }
    if (/^#{1,4}\s+/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#{1,4}\s+/, "");
      const heading = document.createElement(`h${Math.min(level + 1, 4)}`);
      heading.id = uniqueId(ids, text);
      appendInline(heading, text, repo);
      root.append(heading);
      i += 1;
      continue;
    }
    if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      root.append(renderTable(rows, repo));
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const list = document.createElement(line.trim().match(/^\d+\./) ? "ol" : "ul");
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const item = document.createElement("li");
        appendInline(item, lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""), repo);
        list.append(item);
        i += 1;
      }
      root.append(list);
      continue;
    }
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const quote = document.createElement("blockquote");
      appendInline(quote, buf.join(" "), repo);
      root.append(quote);
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      root.append(document.createElement("hr"));
      i += 1;
      continue;
    }
    const buf = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !special(lines[i])) buf.push(lines[i++]);
    const paragraph = document.createElement("p");
    appendInline(paragraph, buf.join(" "), repo);
    root.append(paragraph);
  }
  return root;
}

function special(line) {
  return line.startsWith("```") || /^#{1,4}\s+/.test(line) || line.startsWith("|") || /^\s*([-*]|\d+\.)\s+/.test(line) || line.startsWith(">") || /^(-{3,}|\*{3,})$/.test(line.trim());
}

function renderTable(rows, repo) {
  const table = document.createElement("table");
  const keep = rows.filter((row) => !/^[\s|:-]+$/.test(row));
  if (!keep.length) return table;
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const cell of splitRow(keep[0])) {
    const th = document.createElement("th");
    appendInline(th, cell, repo);
    headRow.append(th);
  }
  head.append(headRow);
  table.append(head);
  const body = document.createElement("tbody");
  for (const row of keep.slice(1)) {
    const tr = document.createElement("tr");
    for (const cell of splitRow(row)) {
      const td = document.createElement("td");
      appendInline(td, cell, repo);
      tr.append(td);
    }
    body.append(tr);
  }
  table.append(body);
  return table;
}

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function appendInline(parent, text, repo) {
  const re = /(`[^`\n]+`)|(!\[[^\]]*\]\([^)\s]+\))|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(#\d+)/g;
  let last = 0;
  for (const match of text.matchAll(re)) {
    if (match.index > last) parent.append(document.createTextNode(text.slice(last, match.index)));
    const token = match[0];
    if (token.startsWith("`")) {
      const code = document.createElement("code");
      code.textContent = token.slice(1, -1);
      parent.append(code);
    } else if (token.startsWith("!")) {
      const imgMatch = token.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (imgMatch && imgMatch[2].startsWith("https://")) {
        const img = document.createElement("img");
        img.alt = imgMatch[1];
        img.src = imgMatch[2];
        parent.append(img);
      } else parent.append(document.createTextNode(token));
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (linkMatch && safeUrl(linkMatch[2])) parent.append(anchor(linkMatch[1], linkMatch[2]));
      else parent.append(document.createTextNode(token));
    } else if (token.startsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = token.slice(2, -2);
      parent.append(strong);
    } else if (token.startsWith("*")) {
      const em = document.createElement("em");
      em.textContent = token.slice(1, -1);
      parent.append(em);
    } else {
      parent.append(anchor(token, `https://github.com/${repo}/issues/${token.slice(1)}`));
    }
    last = match.index + token.length;
  }
  if (last < text.length) parent.append(document.createTextNode(text.slice(last)));
}

function anchor(text, href) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  if (/^https?:/.test(href)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function safeUrl(url) {
  return /^(https?:\/\/|mailto:|#|\/)/.test(url) && !url.toLowerCase().startsWith("javascript:");
}

function uniqueId(ids, text) {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
  let id = base;
  let n = 2;
  while (ids.has(id)) id = `${base}-${n++}`;
  ids.add(id);
  return id;
}

function remember(state) {
  const next = new URL(location.href);
  next.searchParams.set("project", state.project.id);
  next.searchParams.delete("repo");
  if (state.issueNumber) next.searchParams.set("issue", String(state.issueNumber));
  history.replaceState(null, "", next);
}

async function github(path) {
  const response = await fetch(`${GITHUB}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub rate limit reached for this browser. The issues are public; reload after the limit resets.");
  }
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${path.split("?")[0]}`);
  return response.json();
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} loading ${url.pathname}`);
  return response.json();
}

function when(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function note(text) {
  return el("p", "muted", text);
}
