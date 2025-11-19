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
import AddAlbum from "@/components/dialog/AddAlbum.vue";
import AddCollection from "@/components/dialog/AddCollection.vue";
import AddPlaylist from "@/components/dialog/AddPlaylist.vue";
import AddSong from "@/components/dialog/AddSong.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import EditPlaylist from "@/components/dialog/EditPlaylist.vue";
import SearchDialog from "@/components/dialog/SearchDialog.vue";
import WidevineWarning from "@/components/dialog/WidevineWarning.vue";

const dialogStore = useDialog();
</script>
