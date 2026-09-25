<script setup lang="ts">
import { withBase } from "vitepress";

const sections = [
  {
    title: "Start",
    cards: [
      ["Requirements", "Every requirement gathered from the CLI brief, Telegram, and the research pass.", "/guide/requirements", "Contract"],
      ["Where the words came from", "Which stores were searched, and what each one actually contained.", "/guide/search", "Provenance"],
      ["Import into a fork", "Drop these docs in beside a fork. Point the roadmap at that fork's issues.", "/guide/import", "Drop-in"],
    ],
  },
  {
    title: "Roadmap",
    cards: [
      ["Fork issues", "The living roadmap. Reads the fork's GitHub issues when the page opens.", "/roadmap/", "Live"],
      ["Contract", "Lanes, artifact types, embeds, rounds, and scores.", "/guide/contract", "Schema"],
    ],
  },
  {
    title: "Viewer",
    cards: [
      ["Lanes", "Star Wars, cardtwin, Kanto, dream-loop, and the other product lanes.", "/viewer/lanes", "Map"],
      ["Compare", "Reference beside render, with labels.", "/viewer/compare", "HITL"],
      ["Embed the original", "A page, a still, a video, or a GLB. Each one stays itself.", "/viewer/embed", "Types"],
      ["Timeline", "The conversation is the history. The issue is the public form of it.", "/viewer/timeline", "History"],
    ],
  },
];
</script>

<template>
  <div class="atlas">
    <p class="muted">Developer atlas</p>
    <h1>Watch the repo take shape.</h1>
    <p class="lede">
      These docs are the map for an AI-native build: the requirements, the fork's issues, and the pieces themselves.
      A landing page is a different artifact. This is the docs.
    </p>
    <section v-for="section in sections" :key="section.title">
      <h2>{{ section.title }}</h2>
      <div class="grid">
        <a v-for="card in section.cards" :key="card[2]" class="card" :href="withBase(card[2])">
          <small>{{ card[3] }}</small>
          <strong>{{ card[0] }}</strong>
          <span>{{ card[1] }}</span>
        </a>
      </div>
    </section>
  </div>
</template>
