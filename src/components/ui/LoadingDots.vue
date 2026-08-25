<template>
  <div
    :class="{
      small: size === 'small',
      xsmall: size === 'x-small',
      xxsmall: size === 'xx-small',
    }"
    class="loader"
  />
</template>

<script lang="ts" setup>
defineProps<{
  size?: "normal" | "small" | "x-small" | "xx-small";
}>();
</script>

<style scoped>
.loader {
  --loader-border: 0.4rem;
  --loader-size: 2.8rem;

  animation: spin 0.3s linear infinite;
  border: var(--loader-border) solid var(--bg-color);
  border-radius: 50%;
  border-top: var(--loader-border) solid var(--primary-color);
  display: inline-block;
  height: var(--loader-size);
  opacity: 1;
  transition:
    opacity 140ms ease-in-out,
    transform 160ms ease-in-out;
  width: var(--loader-size);
  will-change: transform, opacity;

  /* The size variants only retune the two custom properties above. */
  &.small {
    --loader-border: 0.3rem;
    --loader-size: 1.8rem;
  }

  &.xsmall {
    --loader-border: 0.2rem;
    --loader-size: 1.2rem;
  }

  &.xxsmall {
    --loader-border: 0.12rem;
    --loader-size: 0.9rem;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
