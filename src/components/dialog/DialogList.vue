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
import AddSong from "./AddSong.vue";
import AddPlaylist from "./AddPlaylist.vue";
import EditPlaylist from "./EditPlaylist.vue";
import AddCollection from "./AddCollection.vue";
import WidevineWarning from "./WidevineWarning.vue";
import SearchDialog from "./SearchDialog.vue";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
</script>
