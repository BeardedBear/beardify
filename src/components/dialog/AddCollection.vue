<template>
  <div class="content">
    <input v-model="collectionName" class="input" type="text" placeholder="Nom de la collection" />
    <button class="button button--primary" @click="create()">Créer</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const collectionName = ref("");

function create(): void {
  sidebarStore.addCollection(collectionName.value).then(() => dialogStore.close());
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  text-align: center;
  width: 350px;
}

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 4px;
  color: currentColor;
  display: block;
  font-weight: 700;
  margin-bottom: 20px;
  outline: 0;
  padding: 10px 15px;
  width: 100%;
}
</style>
