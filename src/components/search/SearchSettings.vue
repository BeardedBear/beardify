<template>
  <BdDropdown v-model="open" class="settings" placement="bottom-end">
    <template #trigger>
      <BdTooltip bare content="Choose what to search">
        <BdButton aria-label="Choose what to search" icon-only size="small">
          <i aria-hidden="true" class="icon-settings" />
        </BdButton>
      </BdTooltip>
    </template>
    <div class="panel">
      <p class="panel-title bd-font-bold">Search in</p>
      <BdCheckbox
        v-for="category in SEARCH_CATEGORIES"
        :key="category"
        full-width
        :label="SEARCH_CATEGORY_LABELS[category]"
        :model-value="configStore.searchCategories[category]"
        @update:model-value="(enabled: boolean) => toggle(category, enabled)"
      />
      <!--
        Not an error state: collections are matched locally, so leaving only
        them on is a valid way to search your own library and nothing else.
      -->
      <p v-if="!anyEnabled" class="panel-note">Nothing selected — the results are empty.</p>
    </div>
  </BdDropdown>
</template>

<script lang="ts" setup>
import { BdButton, BdCheckbox, BdDropdown, BdTooltip } from "bearded-ui";
import { computed, ref } from "vue";

import { useConfig } from "@/components/config/ConfigStore";
import {
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABELS,
  SearchCategory,
} from "@/components/search/searchCategories";
import { useSearch } from "@/components/search/SearchStore";

const configStore = useConfig();
const searchStore = useSearch();
const open = ref(false);

const anyEnabled = computed(() => SEARCH_CATEGORIES.some((category) => configStore.searchCategories[category]));

/**
 * Switching a column on has to fetch it: the results on screen were fetched for
 * the previous selection, so without this the new column stays empty until the
 * next keystroke and reads as "no results" rather than "not asked for".
 * @param category - The column being switched
 * @param enabled - Its new state
 */
function toggle(category: SearchCategory, enabled: boolean): void {
  configStore.setSearchCategory(category, enabled);
  if (searchStore.query.length) searchStore.search();
}
</script>

<style scoped>

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-2);
  min-width: 14rem;
  padding: var(--bd-space-2);
}

.panel-title {
  color: var(--bd-primary);
  font-size: var(--bd-font-size-sm);
  margin: 0 0 var(--bd-space-1);
  text-transform: uppercase;
}

.panel-note {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  margin: var(--bd-space-1) 0 0;
}
</style>
