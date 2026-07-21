<template>
  <div class="tier-editor">
    <VueDraggable
      v-model="tiers"
      :animation="150"
      class="tier-list"
      :delay="150"
      force-fallback
      handle=".tier-drag-handle"
      @end="commit"
    >
      <div v-for="(tier, index) in tiers" :key="index" class="tier-row">
        <i class="icon-menu tier-drag-handle" title="Drag to reorder" />
        <span class="tier-color" :style="{ backgroundColor: getTierColor(index, tiers.length) }" />
        <input v-model="tier.label" class="input tier-label" placeholder="Name" type="text" @input="commit" />
        <button
          class="remove"
          :disabled="tiers.length <= 1"
          title="Remove category"
          type="button"
          @click="removeTier(index)"
        >
          ×
        </button>
      </div>
    </VueDraggable>
    <ButtonIndex variant="border" @click="addTier">+ Add category</ButtonIndex>
    <div class="budget" :class="{ over: remaining < 0 }">
      {{ remaining }} / {{ MAX_DESCRIPTION_LENGTH }} characters left
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import {
  buildCollectionDescription,
  getTierColor,
  MAX_DESCRIPTION_LENGTH,
  remainingDescriptionBudget,
  TierList,
} from "@/helpers/collectionOptions";

const props = withDefaults(defineProps<{ descriptionText?: string; modelValue: TierList }>(), {
  descriptionText: "",
});
const emit = defineEmits<{ "update:modelValue": [value: TierList] }>();

const tiers = ref<TierList>(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    tiers.value = value;
  },
);

const remaining = computed(() =>
  remainingDescriptionBudget(buildCollectionDescription(props.descriptionText, true, { tiers: tiers.value, type: "tierlist" })),
);

function addTier(): void {
  tiers.value.push({ label: "", size: 0 });
  commit();
}

function commit(): void {
  emit("update:modelValue", tiers.value);
}

function removeTier(index: number): void {
  if (tiers.value.length <= 1) return;
  tiers.value.splice(index, 1);
  commit();
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.tier-editor {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tier-row {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.tier-drag-handle {
  color: currentcolor;
  cursor: grab;
  flex-shrink: 0;
  opacity: 0.4;

  &:hover {
    opacity: 0.8;
  }
}

.tier-color {
  border-radius: 50%;
  flex-shrink: 0;
  height: 1.2rem;
  width: 1.2rem;
}

.input {
  @include font-bold;

  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 0.3rem;
  color: currentcolor;
  outline: 0;
  padding: 0.6rem 0.8rem;
}

.tier-label {
  flex: 1;
}

.remove {
  background: none;
  border: 0;
  border-radius: 0.3rem;
  color: currentcolor;
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  opacity: 0.6;
  padding: 0.4rem 0.6rem;

  &:hover:not(:disabled) {
    background-color: var(--bg-color-light);
    opacity: 1;
  }

  &:disabled {
    cursor: default;
    opacity: 0.2;
  }
}

.budget {
  font-size: var(--font-size-sm);
  opacity: 0.6;
  text-align: right;

  &.over {
    color: rgb(185 50 50);
    opacity: 1;
  }
}
</style>
