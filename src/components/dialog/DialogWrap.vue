<template>
  <BdDialog v-model="open" padding="none" :size="big ? 'big' : 'default'" :title="withTitle ? title : undefined">
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
  preContent?: boolean;
  title?: string;
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
