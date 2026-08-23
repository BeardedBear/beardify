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
        <BdInput v-model="tier.label" class="tier-label" placeholder="Name" size="small" @input="commit" />
        <BdTooltip content="Remove category">
          <BdButton :disabled="tiers.length <= 1" icon-only size="small" variant="danger" @click="removeTier(index)">
            <i class="icon-x" />
          </BdButton>
        </BdTooltip>
      </div>
    </VueDraggable>
    <BdButton variant="border" @click="addTier">+ Add category</BdButton>
    <div class="budget" :class="{ over: remaining < 0 }">
      {{ remaining }} / {{ MAX_DESCRIPTION_LENGTH }} characters left
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdInput, BdTooltip } from "bearded-ui";
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

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

<style scoped>

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

.tier-label {
  flex: 1;
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
