<template>
  <div v-if="dialogStore.show" class="dialog" :class="{ 'is-closing': dialogStore.isClosing }">
    <div class="bg" :class="{ 'is-closing': dialogStore.isClosing }" @click="dialogStore.close()"></div>
    <div class="dialog-content" :class="{ 'is-closing': dialogStore.isClosing }">
      <div class="head">
        <div v-if="dialogStore.type === 'addalbum'">Ajouter un album à une collection</div>
        <div v-if="dialogStore.type === 'addPlaylist'">Créer une playlist</div>
        <div v-if="dialogStore.type === 'editPlaylist'">Editer une playlist</div>
        <div v-if="dialogStore.type === 'addCollection'">Créer une collection</div>
        <button class="close" @click="dialogStore.close()"><i class="icon-x" /></button>
      </div>
      <AddAlbum v-if="dialogStore.type === 'addalbum'" />
      <AddPlaylist v-if="dialogStore.type === 'addPlaylist'" />
      <EditPlaylist v-if="dialogStore.type === 'editPlaylist'" />
      <AddCollection v-if="dialogStore.type === 'addCollection'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AddAlbum from "./AddAlbum.vue";
import AddPlaylist from "./AddPlaylist.vue";
import AddCollection from "./AddCollection.vue";
import EditPlaylist from "./EditPlaylist.vue";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 4px;

.close {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 4px;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px 8px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    background-color: var(--bg-color);
  }
}

@keyframes pop-bg {
  from {
    opacity: 0;
  }
}

@keyframes bye-bg {
  to {
    opacity: 0;
  }
}

.bg {
  animation: pop-bg 0.2s ease both;
  background-color: var(--bg-color-darker);
  inset: 0;
  opacity: 0.95;
  position: fixed;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}

.dialog {
  backdrop-filter: blur(10px);
  display: grid;
  inset: 0;
  place-content: center;
  position: fixed;
  transition: 200ms;
  z-index: 99999999;

  &.is-closing {
    backdrop-filter: blur(0);
  }
}

.head {
  background-color: var(--bg-color-lighter);
  border-radius: $radius $radius 0 0;
  font-size: 1rem;
  font-weight: 700;
  padding: 15px 25px;
  position: relative;
}

@keyframes pop-dialog-content {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
}

@keyframes bye-dialog-content {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.dialog-content {
  animation: pop-dialog-content 0.2s ease both;
  background: var(--bg-color);
  border-radius: $radius;
  box-shadow: 0 10px 30px var(--bg-color-darker);
  display: grid;
  grid-template-rows: auto 1fr;
  max-height: 600px;
  max-width: 600px;
  position: relative;
  will-change: transform;

  &.is-closing {
    animation: bye-dialog-content 0.2s ease both;
  }
}
</style>
