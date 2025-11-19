<template>
  <div class="search">
    <input
      @input="searchStore.updateQuery(query)"
      class="input"
      placeholder="Recherche..."
      ref="input"
      type="text"
      v-model="query"
    />
    <ButtonIndex no-default-class class="reset" @click="clearQuery()" v-if="query">
      <i class="icon-x" />
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { useSearch } from "@/components/search/SearchStore";

const searchStore = useSearch();
const query = ref<string>("");
const input = ref<HTMLInputElement | null>(null);

function clearQuery(): void {
  searchStore.clear();
  query.value = "";
}

onMounted(() => {
  if (input.value) {
    input.value.focus();
    input.value.value = searchStore.query;
    input.value.setSelectionRange(0, searchStore.query.length);
  }
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as mixins;

$radius: 1rem;

.search {
  padding: 1rem;
  position: relative;
}

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: $radius;
  color: currentcolor;
  font-size: 1.2rem;
  font-weight: 700;
  outline: 0;
  padding: 0.8rem 1.2rem;
  width: 100%;

  @include mixins.squircle;
}

.reset {
  background-color: var(--bg-color-lighter);
  border: 0;
  border-radius: $radius;
  color: currentcolor;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem;
  position: absolute;
  right: 1.8rem;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  width: 2.2rem;
}
</style>
