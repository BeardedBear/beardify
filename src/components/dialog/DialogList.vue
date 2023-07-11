<template>
  <AddAlbum v-if="dialogStore.type === 'addalbum'" />
  <AddPlaylist v-else-if="dialogStore.type === 'createPlaylist'" />
  <AddSong v-else-if="dialogStore.type === 'addSong'" />
  <EditPlaylist v-else-if="dialogStore.type === 'editPlaylist'" />
  <AddCollection v-else-if="dialogStore.type === 'createCollection'" />
  <WidevineWarning v-else-if="dialogStore.type === 'widevine'" />
  <SearchDialog v-else-if="dialogStore.type === 'search'" />
</template>

<script lang="ts" setup>
import AddAlbum from "./AddAlbum.vue";
import AddCollection from "./AddCollection.vue";
import AddPlaylist from "./AddPlaylist.vue";
import AddSong from "./AddSong.vue";
import { useDialog } from "./DialogStore";
import EditPlaylist from "./EditPlaylist.vue";
import SearchDialog from "./SearchDialog.vue";
import WidevineWarning from "./WidevineWarning.vue";

const dialogStore = useDialog();
</script>
