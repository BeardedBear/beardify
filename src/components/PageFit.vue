<template>
  <div class="fit"><slot /></div>
</template>

<style lang="scss" scoped>
@import "../assets/scss/responsive";

.fit {
  margin: 0 auto;
  width: 100%;

  // @include hdpi {
  //   $padd: 50rem;

  //   padding-left: $padd;
  //   padding-right: $padd;

  // }
}
</style>
