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

<style scoped>
.wrap {
  padding: var(--bd-space-4);
  text-align: center;
}

code {
  background-color: var(--bd-bg-darker);
  border-radius: var(--bd-radius-sm);
  display: block;
  font-size: var(--bd-font-size-sm);
  margin: var(--bd-space-2) 0;
  padding: var(--bd-space-1);
}

b {
  color: var(--bd-primary);
}
</style>
