<template>
  <div class="search">
    <input
      ref="input"
      v-model="query"
      class="input"
      type="text"
      placeholder="Recherche..."
      @input="searchStore.updateQuery(query)"
    />
    <button v-if="query" class="reset" @click="clearQuery()">
      <i class="icon-x" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useSearch } from "./SearchStore";

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
@import "../../assets/scss/colors";

$radius: 0.3rem;

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

  &::placeholder {
    color: color.change(rgb(74 75 103), $alpha: 0.4);
    font-style: italic;
  }
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
