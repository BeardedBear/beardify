<template>
  <Dialog title="Create a collection" with-title>
    <div class="wrap">
      <input class="input" placeholder="Collection's name" type="text" v-model="collectionName" />
      <button @click="create()" class="button button-primary">Create</button>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { NotificationType } from "../../@types/Notification";
import { notification } from "../../helpers/notifications";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";
import Dialog from "./DialogWrap.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const collectionName = ref("");

async function create(): Promise<void> {
  try {
    await sidebarStore.addCollection(collectionName.value);
    dialogStore.close();
    notification({ msg: `Collection ${collectionName.value} created`, type: NotificationType.Success });
  } catch {
    // handled upstream
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  padding: 1.3rem;
  text-align: center;
}

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.3rem;
  color: currentcolor;
  display: block;
  font-weight: 700;
  margin-bottom: 1.2rem;
  outline: 0;
  padding: 0.8rem 1rem;
  width: 100%;
}
</style>
