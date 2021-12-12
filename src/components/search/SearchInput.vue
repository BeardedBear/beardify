<template>
  <div class="search">
    <input
      ref="input"
      v-model="query"
      class="input"
      :class="{ opened: query }"
      type="text"
      placeholder="Recherche..."
      @input="searchStore.updateQuery(query)"
    />
    <button v-if="query" class="reset" @click="searchStore.reset()"><i class="icon-x" /></button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useSearch } from "./SearchStore";

const searchStore = useSearch();
const query = ref<string>("");
const input = ref<HTMLInputElement | null>(null);

onMounted(() => input.value && input.value.focus());
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

$radius: 0.3rem;

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: $radius;
  color: currentColor;
  font-weight: 700;
  outline: 0;
  padding: 0.6rem 1rem;
  width: 100%;

  &.opened {
    border-radius: $radius $radius 0 0;
  }

  &::placeholder {
    color: color.change(rgb(74 75 103), $alpha: 0.4);
    font-style: italic;
  }
}

.reset {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: $radius;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  position: absolute;
  right: 0.8rem;
  text-align: center;
  top: 1rem;
  transform: translateY(-50%);
  width: 2.2rem;
}
</style>
