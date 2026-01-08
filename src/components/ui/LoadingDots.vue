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

<style lang="scss" scoped>
$border: 0.4rem;
$size: 2.8rem;

.loader {
  animation: spin 0.3s linear infinite;
  border: $border solid var(--bg-color);
  border-radius: 50%;
  border-top: $border solid var(--primary-color);
  display: inline-block;
  height: $size;
  opacity: 1;
  transition:
    opacity 140ms ease-in-out,
    transform 160ms ease-in-out;
  width: $size;
  will-change: transform, opacity;

  &.small {
    $border: 0.3rem;
    $size: 1.8rem;

    border: $border solid var(--bg-color);
    border-top: $border solid var(--primary-color);
    height: $size;
    width: $size;
  }

  &.xsmall {
    $border: 0.2rem;
    $size: 1.2rem;

    border: $border solid var(--bg-color);
    border-top: $border solid var(--primary-color);
    height: $size;
    width: $size;
  }

  &.xxsmall {
    $border: 0.12rem;
    $size: 0.9rem;

    border: $border solid var(--bg-color);
    border-top: $border solid var(--primary-color);
    height: $size;
    opacity: 1;
    width: $size;
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
