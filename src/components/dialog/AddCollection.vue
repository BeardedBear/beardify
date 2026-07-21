<template>
  <Dialog title="Create a collection" with-title>
    <form class="wrap" @submit.prevent="create()">
      <input v-model="collectionName" class="input" placeholder="Collection's name" type="text" />
      <RankingModeEditor v-model="rankingMode" />
      <ButtonIndex type="submit" variant="primary">Create</ButtonIndex>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import RankingModeEditor from "@/components/dialog/RankingModeEditor.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { CollectionRankingMode } from "@/helpers/collectionOptions";
import { notification } from "@/helpers/notifications";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const collectionName = ref("");
const rankingMode = ref<CollectionRankingMode>({ type: "off" });

async function create(): Promise<void> {
  if (!collectionName.value.trim()) return;
  try {
    await sidebarStore.addCollection(collectionName.value, rankingMode.value);
    dialogStore.close();
    notification({ msg: `Collection ${collectionName.value} created`, type: NotificationType.Success });
  } catch {
    // handled upstream
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.wrap {
  padding: 1.3rem;
  text-align: center;
}

.input {
  @include font-bold;

  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.3rem;
  color: currentcolor;
  display: block;
  margin-bottom: 1.2rem;
  outline: 0;
  padding: 0.8rem 1rem;
  width: 100%;
}
</style>
