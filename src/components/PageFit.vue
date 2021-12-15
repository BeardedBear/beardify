<template>
  <div class="fit"><slot /></div>
</template>

<style lang="scss" scoped>
@import "../assets/scss/responsive";

.fit {
  margin: 0 auto;
  max-width: 57rem;

  @include hdpi {
    max-width: 120rem;
  }
}
</style>
