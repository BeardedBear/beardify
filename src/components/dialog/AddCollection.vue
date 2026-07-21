<template>
  <Dialog title="Create a collection" with-title>
    <form class="wrap" @submit.prevent="create()">
      <input v-model="collectionName" class="input" placeholder="Collection's name" type="text" />
      <div class="option-list section">
        <div class="option">
          <label for="topRanking">Top ranking</label>
          <div class="buttons">
            <ButtonIndex :variant="!topEnabled ? 'primary' : 'default'" @click="topEnabled = false">Off</ButtonIndex>
            <ButtonIndex :variant="topEnabled ? 'primary' : 'default'" @click="topEnabled = true">On</ButtonIndex>
          </div>
        </div>
      </div>
      <div v-if="topEnabled" class="option-list section">
        <div class="option">
          <label for="topPreset">Preset</label>
          <div class="buttons">
            <ButtonIndex
              v-for="preset in TOP_PRESETS"
              :key="preset.id"
              :variant="isSelectedPreset(preset) ? 'primary' : 'default'"
              @click="selectedTiers = preset.tiers"
            >
              {{ preset.label }}
            </ButtonIndex>
          </div>
        </div>
      </div>
      <ButtonIndex type="submit" variant="primary">Create</ButtonIndex>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { TOP_PRESETS, TopPreset, TopTiers } from "@/helpers/collectionOptions";
import { notification } from "@/helpers/notifications";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const collectionName = ref("");
const topEnabled = ref(false);
const selectedTiers = ref<TopTiers>(TOP_PRESETS[1].tiers);

async function create(): Promise<void> {
  if (!collectionName.value.trim()) return;
  try {
    await sidebarStore.addCollection(collectionName.value, topEnabled.value ? selectedTiers.value : null);
    dialogStore.close();
    notification({ msg: `Collection ${collectionName.value} created`, type: NotificationType.Success });
  } catch {
    // handled upstream
  }
}

function isSelectedPreset(preset: TopPreset): boolean {
  return preset.tiers.join("-") === selectedTiers.value.join("-");
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

.option-list {
  display: flex;
  justify-content: space-between;

  .option {
    flex: 1;
  }
}

.section {
  margin-bottom: 1.2rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

label {
  display: block;
  font-style: italic;
  margin-bottom: 0.3rem;
  opacity: 0.6;
  width: 100%;
}
</style>
