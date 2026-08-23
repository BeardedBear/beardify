<template>
  <div class="option-list section">
    <div class="option">
      <label for="rankingMode">Ranking</label>
      <BdButtonGroup v-model="modeType" full :options="MODE_OPTIONS" @update:model-value="commit" />
    </div>
  </div>
  <div v-if="modeType === 'top'" class="option-list section">
    <div class="option">
      <label for="topPreset">Preset</label>
      <BdButtonGroup v-model="selectedPresetId" full :options="presetOptions" />
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
import { BdButtonGroup, BdOption } from "bearded-ui";
import { computed, ref, watch } from "vue";

import TierEditor from "@/components/dialog/TierEditor.vue";
import { CollectionRankingMode, TierList, TOP_PRESETS, TopTiers } from "@/helpers/collectionOptions";

const MODE_OPTIONS: BdOption[] = [
  { label: "Off", value: "off" },
  { label: "Top", value: "top" },
  { label: "Tier list", value: "tierlist" },
];

const presetOptions: BdOption[] = TOP_PRESETS.map((preset) => ({ label: preset.label, value: preset.id }));

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

const modeType = ref<CollectionRankingMode["type"]>(props.modelValue.type);
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

const selectedPresetId = computed<string>({
  get: () => TOP_PRESETS.find((preset) => preset.tiers.join("-") === topTiers.value.join("-"))?.id ?? "",
  set: (id) => {
    const preset = TOP_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    topTiers.value = preset.tiers;
    commit();
  },
});
</script>

<style scoped>
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

label {
  display: block;
  font-style: italic;
  margin-bottom: 0.3rem;
  opacity: 0.6;
  width: 100%;
}
</style>
