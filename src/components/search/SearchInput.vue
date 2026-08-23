<template>
  <div class="search">
    <BdInput
      ref="input"
      v-model="query"
      placeholder="Recherche..."
      size="big"
      type="search"
      @input="searchStore.updateQuery(query)"
    />
    <BdButton v-if="query" class="reset" icon-only size="small" @click="clearQuery()">
      <i class="icon-x" />
    </BdButton>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdInput } from "bearded-ui";
import { onMounted, ref } from "vue";

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
  input.value?.focus();
  input.value?.select();
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
