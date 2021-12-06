<template><div class="loader"></div></template>

<style lang="scss" scoped>
$border: 0.4rem;
$size: 2.8rem;

.loader {
  animation: spin 0.3s linear infinite;
  border: $border solid var(--bg-color); /* Light grey */
  border-radius: 50%;
  border-top: $border solid var(--primary-color); /* Blue */
  height: $size;
  width: $size;
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
