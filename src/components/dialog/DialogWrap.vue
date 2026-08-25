<template>
  <BdDialog
    v-model="open"
    :height="height"
    :max-height="maxHeight"
    :max-width="maxWidth"
    :width="width"
    :size="big ? 'big' : 'default'"
    :title="withTitle ? title : undefined"
    padding="none"
  >
    <div v-if="preContent" class="pre-content">
      <slot name="pre-content" />
    </div>
    <slot />
  </BdDialog>
</template>

<script lang="ts" setup>
import { BdDialog } from "bearded-ui";
import { computed } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";

defineProps<{
  big?: boolean;
  /** Fixes the dialog height, so it does not resize as content arrives. */
  height?: string;
  /** Caps the dialog height. Any CSS length; the library default is 90vh. */
  maxHeight?: string;
  /** Caps the dialog width. Any CSS length; the library default is 90vw. */
  maxWidth?: string;
  preContent?: boolean;
  title?: string;
  /** Fixes the dialog width, overriding the `big` preset. */
  width?: string;
  withTitle: boolean;
}>();

const dialogStore = useDialog();

/*
 * The store owns the open state — every dialog is mounted by DialogList from
 * `dialogStore.type`. BdDialog only reports the closing gestures it handles
 * itself (Escape, backdrop, cross), which the store then turns into its own
 * closing animation.
 */
const open = computed<boolean>({
  get: () => dialogStore.show && !dialogStore.isClosing,
  set: (value) => {
    if (!value && !dialogStore.isClosing) dialogStore.close();
  },
});
</script>

<style scoped>
.pre-content {
  border-bottom: 0.1rem solid var(--bg-color-light);
}
</style>
