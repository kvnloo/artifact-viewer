const VIEWER_BASE = new URL(".", import.meta.url);

export async function mount(target, options = {}) {
  const root = typeof target === "string" ? document.querySelector(target) : target;
  if (!root) throw new Error("artifact viewer mount target missing");
  const params = new URLSearchParams(location.search);
  const state = {
    root,
    options,
    projects: [],
    catalog: null,
    catalogUrl: null,
    artifactId: params.get("artifact"),
    view: params.get("view") || "project",
  };
  root.innerHTML = "";
  root.append(shell());
  try {
    const direct = options.catalog || params.get("catalog");
    if (direct) {
      await openCatalog(state, new URL(direct, location.href));
    } else {
      const index = await loadJson(new URL("projects.json", VIEWER_BASE));
      state.projects = index.projects || [];
      const wanted = options.project || params.get("project");
      const chosen = state.projects.find((p) => p.id === wanted) || (state.projects.length === 1 ? state.projects[0] : null);
      if (chosen) await openCatalog(state, new URL(chosen.catalog, VIEWER_BASE));
      else renderChooser(state);
    }
  } catch (err) {
    root.querySelector("main").replaceChildren(p(`Could not load the catalog (${err.message}).`));
  }
  return state;
}

function shell() {
  const header = document.createElement("header");
  const title = document.createElement("h1");
  const home = document.createElement("button");
  home.type = "button";
  home.textContent = "Artifact viewer";
  home.dataset.action = "home";
  title.append(home);
  const nav = document.createElement("nav");
  nav.innerHTML = "";
  for (const [id, label] of [["project", "Roadmap"], ["pieces", "Pieces"], ["compare", "Compare"]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.view = id;
    b.textContent = label;
    nav.append(b);
  }
  header.append(title, nav);
  const main = document.createElement("main");
  const wrap = document.createElement("div");
  wrap.append(header, main);
  wrap.addEventListener("click", (event) => {
    const node = event.currentTarget;
    const action = event.target.closest("[data-action], [data-view], [data-artifact]");
    if (!action || !node.contains(action)) return;
    const st = node.__state;
    if (!st) return;
    if (action.dataset.action === "home") {
      history.replaceState(null, "", location.pathname);
      renderChooser(st);
    } else if (action.dataset.view) {
      st.view = action.dataset.view;
      paint(st);
    } else if (action.dataset.artifact) {
      st.artifactId = action.dataset.artifact;
      st.view = "project";
      paint(st);
    }
  });
  return wrap;
}

async function openCatalog(state, url) {
  state.catalogUrl = url;
  state.catalog = await loadJson(url);
  const projectId = state.catalog.project?.id;
  if (projectId && !new URL(location.href).searchParams.get("catalog")) {
    const next = new URL(location.href);
    if (next.searchParams.get("project") !== projectId) {
      next.searchParams.set("project", projectId);
      history.replaceState(null, "", next);
    }
  }
  const wrap = state.root.firstElementChild;
  wrap.__state = state;
  if (!state.artifactId) {
    const road = (state.catalog.artifacts || []).find((a) => a.kind === "roadmap");
    state.artifactId = road ? road.id : (state.catalog.artifacts || [])[0]?.id || null;
  }
  paint(state);
}

function paint(state) {
  const wrap = state.root.firstElementChild;
  wrap.__state = state;
  for (const button of wrap.querySelectorAll("nav button")) {
    button.classList.toggle("active", button.dataset.view === state.view);
  }
  const main = wrap.querySelector("main");
  main.replaceChildren();
  if (state.view === "pieces") main.append(pieces(state));
  else if (state.view === "compare") main.append(compare(state));
  else main.append(roadmap(state));
}

function renderChooser(state) {
  const wrap = state.root.firstElementChild;
  wrap.__state = state;
  const main = wrap.querySelector("main");
  const box = document.createElement("div");
  box.className = "projects";
  const intro = document.createElement("div");
  intro.append(kicker("Projects"), heading("What each repo has produced."), lead("Pick a project. A fork publishes a catalog.json and this shell embeds each artifact as its own type."));
  if (!state.projects.length) intro.append(p("No projects are registered in projects.json yet."));
  main.replaceChildren(intro, box);
  for (const project of state.projects) {
    const button = document.createElement("button");
    button.className = "project";
    button.type = "button";
    const k = kicker(project.id);
    const h = document.createElement("h3");
    h.textContent = project.title;
    const s = document.createElement("p");
    s.className = "muted";
    s.textContent = project.summary || "";
    button.append(k, h, s);
    button.onclick = async () => {
      const next = new URL(location.href);
      next.searchParams.set("project", project.id);
      next.searchParams.delete("catalog");
      history.replaceState(null, "", next);
      await openCatalog(state, new URL(project.catalog, VIEWER_BASE));
    };
    box.append(button);
  }
}

function roadmap(state) {
  const art = artifact(state);
  const box = document.createElement("article");
  if (!art) {
    box.append(p("This catalog has no artifacts."));
    return box;
  }
  const project = state.catalog.project || {};
  box.append(kicker(`${project.title || project.id || "Project"} · ${art.kicker || art.kind}`));
  const h = heading(art.headline || art.title);
  box.append(h);
  const status = document.createElement("p");
  const pill = document.createElement("span");
  pill.className = `status ${art.status || ""}`;
  pill.textContent = art.status || art.kind;
  status.append(pill, " ");
  if (art.summary) status.append(document.createTextNode(art.summary));
  box.append(status);
  if (art.progress) box.append(metrics(art.progress));
  if (art.coverage?.length) box.append(bars(art.coverage));
  if (art.decision) {
    const d = document.createElement("p");
    d.className = "decision";
    const b = document.createElement("b");
    b.textContent = "Decision in force. ";
    d.append(b, document.createTextNode(art.decision));
    box.append(d);
  }
  box.append(actions(state, art, project));
  if (art.steps?.length) {
    const h2 = document.createElement("h2");
    h2.style.fontSize = "1.15rem";
    h2.textContent = "Follow the packages";
    box.append(h2, steps(state, art));
  }
  const frame = preview(state, art);
  if (frame) box.append(frame);
  if (art.gaps?.length) {
    const g = document.createElement("p");
    g.className = "gap muted";
    g.textContent = `Still missing beside the atlas: ${art.gaps.join(", ")}.`;
    box.append(g);
  }
  return box;
}

function pieces(state) {
  const box = document.createElement("div");
  box.append(kicker("Pieces"), heading("Every artifact in this catalog."));
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const art of state.catalog.artifacts || []) {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.dataset.artifact = art.id;
    const thumb = preview(state, art, 160);
    const meta = document.createElement("div");
    meta.className = "meta";
    const strong = document.createElement("strong");
    strong.textContent = art.title;
    meta.append(strong, document.createTextNode(`${art.kind} · ${art.embed}`));
    if (thumb) card.append(thumb);
    card.append(meta);
    grid.append(card);
  }
  const downloads = (state.catalog.artifacts || []).flatMap((a) => a.downloads || []);
  if (downloads.length) {
    const list = document.createElement("div");
    list.className = "actions";
    for (const file of downloads) {
      const a = document.createElement("a");
      a.className = "btn";
      a.href = resolve(state, file.href);
      a.textContent = file.label;
      list.append(a);
    }
    box.append(grid, list);
  } else box.append(grid);
  return box;
}

function compare(state) {
  const box = document.createElement("div");
  const images = (state.catalog.artifacts || []).filter((a) => a.embed === "image");
  box.append(kicker("Compare"), heading("Two stills, side by side."));
  if (images.length < 2) {
    box.append(p("This catalog has no image pair yet. Stills from a lane such as cardtwin, charizard, or a dream-loop capture show up here when their embed is image."));
    return box;
  }
  const grid = document.createElement("div");
  grid.className = "compare";
  grid.append(pane(state, images, 0), pane(state, images, Math.min(1, images.length - 1)));
  box.append(grid);
  return box;
}

function pane(state, images, index) {
  const col = document.createElement("div");
  const select = document.createElement("select");
  images.forEach((art, i) => {
    const opt = document.createElement("option");
    opt.value = art.id;
    opt.textContent = art.title;
    if (i === index) opt.selected = true;
    select.append(opt);
  });
  const slot = document.createElement("div");
  const draw = () => {
    const art = images.find((a) => a.id === select.value);
    slot.replaceChildren(preview(state, art, 420));
  };
  select.onchange = draw;
  draw();
  col.append(select, slot);
  return col;
}

function metrics(progress) {
  const row = document.createElement("div");
  row.className = "metrics";
  const items = [
    [progress.requirements_mapped, "requirements mapped"],
    [progress.acceptance_requalified, "acceptance requalified"],
    [progress.packages_proposed, "packages proposed"],
    [progress.packages_accepted, "packages accepted"],
  ];
  for (const [value, label] of items) {
    if (value == null) continue;
    const cell = document.createElement("div");
    cell.className = "metric";
    const b = document.createElement("b");
    b.textContent = String(value);
    const s = document.createElement("span");
    s.textContent = label;
    cell.append(b, s);
    row.append(cell);
  }
  return row;
}

function bars(coverage) {
  const total = coverage.reduce((sum, item) => sum + item.count, 0) || 1;
  const box = document.createElement("div");
  box.className = "coverage";
  for (const item of coverage) {
    const row = document.createElement("div");
    row.className = "bar";
    const label = document.createElement("span");
    label.textContent = item.label;
    const count = document.createElement("b");
    count.textContent = String(item.count);
    const track = document.createElement("div");
    track.className = "track";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round((item.count / total) * 100)}%`;
    track.append(fill);
    row.append(label, count, track);
    box.append(row);
  }
  return box;
}

function steps(state, art) {
  const list = document.createElement("div");
  list.className = "steps";
  for (const step of art.steps) {
    const a = document.createElement("a");
    a.className = "step";
    a.href = resolve(state, step.href || art.href);
    const id = document.createElement("div");
    id.className = "id";
    id.textContent = step.id;
    const body = document.createElement("div");
    const h = document.createElement("h3");
    h.textContent = step.title;
    const owner = document.createElement("div");
    owner.className = "owner";
    owner.textContent = `${step.status || "proposed"}${step.owner ? " · " + step.owner : ""}`;
    body.append(h, owner);
    if (step.summary) {
      const p = document.createElement("p");
      p.textContent = step.summary;
      body.append(p);
    }
    a.append(id, body);
    list.append(a);
  }
  return list;
}

function actions(state, art, project) {
  const row = document.createElement("div");
  row.className = "actions";
  const open = document.createElement("a");
  open.className = "btn primary";
  open.href = resolve(state, art.href);
  open.textContent = "Open the atlas";
  row.append(open);
  if (project.issue) row.append(link(project.issue, "Issue"));
  if (art.commit_url) row.append(link(art.commit_url, `Commit ${(art.commit || "").slice(0, 7)}`));
  if (project.repo) row.append(link(project.repo, "Fork"));
  return row;
}

function preview(state, art, height) {
  if (!art || art.embed === "none") return null;
  const url = resolve(state, art.href);
  if (art.embed === "image") {
    const img = document.createElement("img");
    img.src = url;
    img.alt = art.title;
    if (height) img.style.height = `${height}px`;
    return img;
  }
  if (art.embed === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    if (height) video.style.height = `${height}px`;
    return video;
  }
  if (art.embed === "model") {
    const model = document.createElement("model-viewer");
    model.setAttribute("src", url);
    model.setAttribute("camera-controls", "");
    model.style.height = `${height || 420}px`;
    model.style.width = "100%";
    return model;
  }
  const frame = document.createElement("iframe");
  frame.className = "frame";
  frame.src = url;
  frame.title = art.title;
  if (height) frame.style.height = `${height}px`;
  return frame;
}

function artifact(state) {
  const list = state.catalog?.artifacts || [];
  return list.find((a) => a.id === state.artifactId) || list[0] || null;
}

function resolve(state, href) {
  if (!href) return "";
  return new URL(href, state.catalogUrl).href;
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url.pathname || url}`);
  return response.json();
}

function kicker(text) {
  const n = document.createElement("div");
  n.className = "kicker";
  n.textContent = text;
  return n;
}
function heading(text) {
  const n = document.createElement("h2");
  n.textContent = text;
  return n;
}
function lead(text) {
  const n = document.createElement("p");
  n.className = "lead";
  n.textContent = text;
  return n;
}
function p(text) {
  const n = document.createElement("p");
  n.className = "muted";
  n.textContent = text;
  return n;
}
function link(href, text) {
  const a = document.createElement("a");
  a.className = "btn";
  a.href = href;
  a.textContent = text;
  return a;
}
