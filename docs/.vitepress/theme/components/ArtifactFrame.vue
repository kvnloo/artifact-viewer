<script setup lang="ts">
defineProps<{
  kind: "image" | "iframe" | "video" | "model" | "file";
  src: string;
  title?: string;
}>();
</script>

<template>
  <div class="frame">
    <img v-if="kind === 'image'" :src="src" :alt="title || ''" />
    <iframe v-else-if="kind === 'iframe'" :src="src" :title="title || 'Page'" />
    <video v-else-if="kind === 'video'" :src="src" controls />
    <model-viewer v-else-if="kind === 'model'" :src="src" camera-controls style="height: 420px" />
    <p v-else class="muted"><a :href="src">{{ title || src }}</a> stays a file. Blend files are not edited in the browser.</p>
  </div>
</template>
