<template>
  <div class="fit"><slot /></div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;

.fit {
  margin: 0 auto;
  width: 100%;
}
</style>
