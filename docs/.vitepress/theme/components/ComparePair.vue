<script setup lang="ts">
defineProps<{
  left?: string;
  right?: string;
  leftLabel?: string;
  rightLabel?: string;
}>();
</script>

<template>
  <div class="pair">
    <figure>
      <figcaption>{{ leftLabel || "Reference" }}</figcaption>
      <img v-if="left" :src="left" :alt="leftLabel || 'Reference'" />
      <p v-else class="muted">Drop the reference still here. The label stays so it cannot be mistaken for the render.</p>
    </figure>
    <figure>
      <figcaption>{{ rightLabel || "Render" }}</figcaption>
      <img v-if="right" :src="right" :alt="rightLabel || 'Render'" />
      <p v-else class="muted">Drop the current render here.</p>
    </figure>
  </div>
</template>
