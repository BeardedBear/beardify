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
      aria-label="Search Spotify"
      autofocus
      placeholder="Search"
      size="big"
      type="search"
      @input="searchStore.updateQuery(query)"
    />
    <BdTooltip v-if="query" bare content="Clear search">
      <BdButton aria-label="Clear search" class="reset" icon-only size="small" @click="clearQuery()">
        <i aria-hidden="true" class="icon-x" />
      </BdButton>
    </BdTooltip>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdInput, BdTooltip } from "bearded-ui";
import { nextTick, onMounted, ref, watch } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import { useSearch } from "@/components/search/SearchStore";

const searchStore = useSearch();
const dialogStore = useDialog();
const query = ref<string>("");
const input = ref<InstanceType<typeof BdInput> | null>(null);

/**
 * Show the store's query and select it, so typing replaces the previous search.
 *
 * Selection waits a tick: it is not part of the dialog's focusing steps, and this
 * component is ready before BdDialog calls showModal().
 */
function adoptStoreQuery(): void {
  query.value = searchStore.query;
  nextTick(() => input.value?.select());
}

function clearQuery(): void {
  searchStore.clear();
  query.value = "";
}

/*
 * Mount is not enough, and this used to be all there was.
 *
 * BdDialog renders a native <dialog> that stays in the DOM — opening and closing
 * only calls showModal()/close() — and dialogStore.close() leaves `type` alone, so
 * DialogList never tears this subtree down. The field therefore mounts once, for
 * the lifetime of the app. Anything opening the dialog pre-filled (an artist or
 * album name from the releases feed, say) set the store, searched correctly, and
 * left the previous search sitting in the input.
 */
watch(
  () => dialogStore.show && dialogStore.type === "search",
  (isOpen) => isOpen && adoptStoreQuery(),
);

/*
 * Not folded into the watcher above: the store is also written while the dialog is
 * already open — the prefilled-query path can fire from a dialog that is up — and
 * an input showing something other than what is being searched is the same bug.
 */
watch(() => searchStore.query, (value) => (query.value = value));

onMounted(adoptStoreQuery);
</script>

<style scoped>

/*
 * `type="search"` makes Chromium and WebKit draw their own clear cross, which
 * landed directly under the custom .reset button. One control, not two.
 */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.search :deep(input[type="search"])::-webkit-search-cancel-button {
  appearance: none;
}

.search {
  --search-radius: 1rem;

  padding: var(--bd-space-4);
  position: relative;
}

.reset {
  position: absolute;
  right: 1.8rem;
  top: 50%;
  transform: translateY(-50%);
}
</style>
