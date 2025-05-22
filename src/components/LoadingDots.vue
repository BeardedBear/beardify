<template>
  <div :class="{ small: size === 'small' }" class="loader"></div>
</template>

<script lang="ts" setup>
defineProps<{
  size?: "normal" | "small";
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
  width: $size;

  &.small {
    $border: 0.3rem;
    $size: 1.8rem;

    border: $border solid var(--bg-color);
    border-top: $border solid var(--primary-color);
    height: $size;
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
