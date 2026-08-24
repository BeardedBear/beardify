<template>
  <div class="search">
    <!--
      `autofocus` is what actually wins the focus here. The dialog's close
      button sits in BdDialog's <header>, so it is the first focusable
      descendant, and `showModal()` hands it the focus as part of opening —
      overriding any focus() called from a child's onMounted, which runs first.
      The attribute makes the browser's own focusing steps pick this field.
    -->
    <BdInput
      ref="input"
      v-model="query"
      autofocus
      placeholder="Search..."
      size="big"
      type="search"
      @input="searchStore.updateQuery(query)"
    />
    <BdButton
      v-if="query"
      aria-label="Clear search"
      class="reset"
      icon-only
      size="small"
      title="Clear search"
      @click="clearQuery()"
    >
      <i aria-hidden="true" class="icon-x" />
    </BdButton>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdInput } from "bearded-ui";
import { nextTick, onMounted, ref } from "vue";

import { useSearch } from "@/components/search/SearchStore";

const searchStore = useSearch();
const query = ref<string>("");
const input = ref<InstanceType<typeof BdInput> | null>(null);

function clearQuery(): void {
  searchStore.clear();
  query.value = "";
}

onMounted(() => {
  query.value = searchStore.query;

  /*
   * After the tick, not during it: selection is not part of the dialog focusing
   * steps, and this component mounts before BdDialog calls showModal(). Waiting
   * lets the dialog finish opening, then selects whatever the last search left
   * behind so typing replaces it instead of appending to it.
   */
  nextTick(() => input.value?.select());
});
</script>

<style scoped>

.search {
  --search-radius: 1rem;

  padding: 1rem;
  position: relative;
}

.reset {
  position: absolute;
  right: 1.8rem;
  top: 50%;
  transform: translateY(-50%);
}
</style>
