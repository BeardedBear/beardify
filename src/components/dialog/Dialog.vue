<template>
  <div v-if="dialogStore.show" class="dialog" :class="{ 'is-closing': dialogStore.isClosing }">
    <div class="bg" :class="{ 'is-closing': dialogStore.isClosing }" @click="dialogStore.close()"></div>
    <div class="dialog-content" :class="{ 'is-closing': dialogStore.isClosing }">
      <div class="head">
        <div v-if="dialogStore.type === 'addalbum'">Ajouter un album à une collection</div>
        <div v-if="dialogStore.type === 'addSong'">Ajouter un morceau à une playlist</div>
        <div v-if="dialogStore.type === 'addPlaylist'">Créer une playlist</div>
        <div v-if="dialogStore.type === 'editPlaylist'">Editer une playlist</div>
        <div v-if="dialogStore.type === 'addCollection'">Créer une collection</div>
        <div v-if="dialogStore.type === 'widevine'">Attention !</div>
        <button class="close" @click="dialogStore.close()"><i class="icon-x" /></button>
      </div>
      <AddAlbum v-if="dialogStore.type === 'addalbum'" />
      <AddSong v-if="dialogStore.type === 'addSong'" />
      <AddPlaylist v-if="dialogStore.type === 'addPlaylist'" />
      <EditPlaylist v-if="dialogStore.type === 'editPlaylist'" />
      <AddCollection v-if="dialogStore.type === 'addCollection'" />
      <WinevineWarning v-if="dialogStore.type === 'widevine'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AddAlbum from "./AddAlbum.vue";
import AddSong from "./AddSong.vue";
import AddPlaylist from "./AddPlaylist.vue";
import AddCollection from "./AddCollection.vue";
import EditPlaylist from "./EditPlaylist.vue";
import { useDialog } from "./DialogStore";
import WinevineWarning from "./WidevineWarning.vue";

const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 0.4rem;

.close {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.4rem;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.4rem 0.5rem;
  position: absolute;
  right: 0.9rem;
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

  to {
    opacity: 1;
  }
}

@keyframes bye-bg {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.bg {
  animation: pop-bg 0.2s ease both;
  background-color: var(--bg-color-darker);
  filter: opacity(0.85);
  inset: 0;
  position: fixed;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}

.dialog {
  backdrop-filter: blur(1rem);
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
  padding: 1rem 1.5rem;
  position: relative;
}

@keyframes pop-dialog-content {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bye-dialog-content {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.dialog-content {
  animation: pop-dialog-content 0.2s ease both;
  background: var(--bg-color);
  border-radius: $radius;
  box-shadow: 0 0.8rem 2rem var(--bg-color-darker);
  display: grid;
  grid-template-rows: auto 1fr;
  max-height: 30rem;
  max-width: 30rem;
  position: relative;
  will-change: transform;

  &.is-closing {
    animation: bye-dialog-content 0.2s ease both;
  }
}
</style>
