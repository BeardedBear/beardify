<template>
  <div class="option-list section">
    <div class="option">
      <label for="rankingMode">Ranking</label>
      <div class="buttons">
        <ButtonIndex :variant="modeType === 'off' ? 'primary' : 'default'" @click="setMode('off')">Off</ButtonIndex>
        <ButtonIndex :variant="modeType === 'top' ? 'primary' : 'default'" @click="setMode('top')">Top</ButtonIndex>
        <ButtonIndex :variant="modeType === 'tierlist' ? 'primary' : 'default'" @click="setMode('tierlist')">
          Tier list
        </ButtonIndex>
      </div>
    </div>
  </div>
  <div v-if="modeType === 'top'" class="option-list section">
    <div class="option">
      <label for="topPreset">Preset</label>
      <div class="buttons">
        <ButtonIndex
          v-for="preset in TOP_PRESETS"
          :key="preset.id"
          :variant="isSelectedPreset(preset) ? 'primary' : 'default'"
          @click="selectPreset(preset)"
        >
          {{ preset.label }}
        </ButtonIndex>
      </div>
    </div>
  </div>
  <div v-else-if="modeType === 'tierlist'" class="section">
    <TierEditor
      :description-text="descriptionText"
      :model-value="tierListTiers"
      @update:model-value="handleTierListChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import TierEditor from "@/components/dialog/TierEditor.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { CollectionRankingMode, TierList, TOP_PRESETS, TopPreset, TopTiers } from "@/helpers/collectionOptions";

const props = withDefaults(defineProps<{ descriptionText?: string; modelValue: CollectionRankingMode }>(), {
  descriptionText: "",
});
const emit = defineEmits<{ "update:modelValue": [value: CollectionRankingMode] }>();

function defaultTierList(): TierList {
  return [
    { label: "S", size: 0 },
    { label: "A", size: 0 },
    { label: "B", size: 0 },
  ];
}

const modeType = ref(props.modelValue.type);
const topTiers = ref<TopTiers>(props.modelValue.type === "top" ? props.modelValue.tiers : TOP_PRESETS[1].tiers);
const tierListTiers = ref<TierList>(props.modelValue.type === "tierlist" ? props.modelValue.tiers : defaultTierList());

watch(
  () => props.modelValue,
  (value) => {
    modeType.value = value.type;
    if (value.type === "top") topTiers.value = value.tiers;
    if (value.type === "tierlist") tierListTiers.value = value.tiers;
  },
);

function commit(): void {
  if (modeType.value === "top") emit("update:modelValue", { tiers: topTiers.value, type: "top" });
  else if (modeType.value === "tierlist") emit("update:modelValue", { tiers: tierListTiers.value, type: "tierlist" });
  else emit("update:modelValue", { type: "off" });
}

function handleTierListChange(value: TierList): void {
  tierListTiers.value = value;
  commit();
}

function isSelectedPreset(preset: TopPreset): boolean {
  return preset.tiers.join("-") === topTiers.value.join("-");
}

function selectPreset(preset: TopPreset): void {
  topTiers.value = preset.tiers;
  commit();
}

function setMode(mode: CollectionRankingMode["type"]): void {
  modeType.value = mode;
  commit();
}
</script>

<style lang="scss" scoped>
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
