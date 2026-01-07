<template>
  <Dialog :with-title="false">
    <div class="wrap">
      <p>
        As a Brave user, in order to use
        <b>Beardify</b>
        , you need to enable the
        <b>Widevine</b>
        option to play songs from
        <b>Spotify</b>
      </p>

      <p>
        To do this, enter the following address
        <code>brave://settings/?search=widevine</code>
        then activate
        <b>Widevine</b>
        .
      </p>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import Dialog from "@/components/dialog/DialogWrap.vue";
</script>

<style lang="scss" scoped>
.wrap {
  padding: 1.2rem;
  text-align: center;
}

code {
  background-color: var(--bg-color-darker);
  border-radius: 0.4rem;
  display: block;
  font-size: var(--font-size-md);
  margin: 0.4rem 0;
  padding: 0.3rem;
}

b {
  color: var(--primary-color);
}
</style>
