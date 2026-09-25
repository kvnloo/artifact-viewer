<script setup lang="ts">
import { onMounted, ref } from "vue";
import { blocks, roadmapFence } from "../../../../src/markdown.js";

const props = defineProps<{ repo: string }>();

type Issue = {
  number: number;
  title: string;
  state: string;
  body: string;
  html_url: string;
  updated_at: string;
  pull_request?: unknown;
};

const status = ref("Loading issues…");
const source = ref("");
const prior = ref("");
const issues = ref<Issue[]>([]);
const selected = ref<number | null>(null);

onMounted(load);

async function load() {
  try {
    const meta = await github(`/repos/${props.repo}`);
    const owner = meta.owner.login as string;
    const parent = meta.parent?.full_name as string | undefined;
    let list: Issue[] = [];
    if (meta.has_issues) {
      source.value = `Issues on ${props.repo}.`;
      list = await listIssues(props.repo);
      if (!list.length && parent) {
        prior.value = `https://github.com/${parent}/issues?q=${encodeURIComponent(`is:issue author:${owner}`)}`;
      }
    } else if (parent) {
      source.value = `${props.repo} files issues on ${parent}. Showing the ones opened by ${owner}.`;
      list = await listIssues(parent, owner);
    } else {
      source.value = `Issues on ${props.repo}.`;
      list = await listIssues(props.repo);
    }
    issues.value = list
      .filter((item) => !item.pull_request)
      .sort((a, b) => Number(/rfc/i.test(b.title)) - Number(/rfc/i.test(a.title)) || Date.parse(b.updated_at) - Date.parse(a.updated_at));
    selected.value = issues.value.find((item) => /rfc/i.test(item.title))?.number ?? issues.value[0]?.number ?? null;
    status.value = "";
  } catch (error) {
    status.value = error instanceof Error ? error.message : "Could not load issues.";
  }
}

async function listIssues(repo: string, creator?: string) {
  const query = new URLSearchParams({ state: "all", per_page: "100", sort: "updated", direction: "desc" });
  if (creator) query.set("creator", creator);
  const batch = await github(`/repos/${repo}/issues?${query}`);
  return batch as Issue[];
}

async function github(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub rate limit reached for this browser. Reload after it resets.");
  }
  if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);
  return response.json();
}

function current() {
  return issues.value.find((item) => item.number === selected.value) || null;
}
function parsed(body: string) {
  return blocks(body || "");
}
function order(body: string) {
  return roadmapFence(body || "");
}
function when(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function repoOf(url: string) {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match?.[1] || props.repo;
}
</script>

<template>
  <p v-if="status" class="muted">{{ status }}</p>
  <div v-else class="issue-layout">
    <aside class="issue-list">
      <p class="muted">{{ source }}</p>
      <p v-if="!issues.length" class="muted">
        No issues on {{ repo }} yet.
        <a v-if="prior" :href="prior">Earlier issues stayed on the parent tracker.</a>
      </p>
      <button
        v-for="issue in issues"
        :key="issue.number"
        class="issue"
        :class="{ on: issue.number === selected }"
        type="button"
        @click="selected = issue.number"
      >
        <span class="pill" :class="issue.state">{{ issue.state }}</span>
        <strong>{{ issue.title }}</strong>
        <span class="muted">#{{ issue.number }} · {{ when(issue.updated_at) }}</span>
      </button>
    </aside>
    <article v-if="current()" class="prose">
      <p class="muted">#{{ current()!.number }}</p>
      <h2>{{ current()!.title }}</h2>
      <p><a :href="current()!.html_url">Open on GitHub</a></p>
      <template v-if="order(current()!.body)">
        <p class="muted">Proposed order</p>
        <pre class="roadmap">{{ order(current()!.body) }}</pre>
      </template>
      <template v-for="(block, index) in parsed(current()!.body)" :key="index">
        <component :is="`h${Math.min(block.level + 1, 4)}`" v-if="block.type === 'h'" :id="block.id">{{ block.text }}</component>
        <p v-else-if="block.type === 'p'">{{ block.text }}</p>
        <blockquote v-else-if="block.type === 'quote'">{{ block.text }}</blockquote>
        <pre v-else-if="block.type === 'pre'"><code>{{ block.text }}</code></pre>
        <ul v-else-if="block.type === 'ul'"><li v-for="item in block.items" :key="item">{{ item }}</li></ul>
        <ol v-else-if="block.type === 'ol'"><li v-for="item in block.items" :key="item">{{ item }}</li></ol>
        <hr v-else-if="block.type === 'hr'" />
        <table v-else-if="block.type === 'table'">
          <thead><tr><th v-for="cell in block.header" :key="cell">{{ cell }}</th></tr></thead>
          <tbody>
            <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <p class="muted">Linked issues resolve on {{ repoOf(current()!.html_url) }}.</p>
    </article>
  </div>
</template>
