<template>
  <div class="mobile-header">
    <BdTooltip bare content="Open menu">
      <BdButton icon-only label="Open menu" @click="sidebarStore.toggle()">
        <i aria-hidden="true" class="icon-menu" />
      </BdButton>
    </BdTooltip>
    <router-link to="/" class="logo-link">
      <img alt="Beardify home" class="logo" src="/img/logo.svg" />
    </router-link>
    <BdTooltip bare content="Search">
      <BdButton icon-only label="Search" @click="dialogStore.open({ type: 'search' })">
        <i aria-hidden="true" class="icon-search" />
      </BdButton>
    </BdTooltip>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdTooltip } from "bearded-ui";
import { RouterLink } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import { useSidebar } from "@/components/sidebar/SidebarStore";

const sidebarStore = useSidebar();
const dialogStore = useDialog();
</script>

<style scoped>

.mobile-header {
  align-items: center;
  background: var(--bd-bg-dark);
  display: none;
  justify-content: space-between;
  padding: var(--bd-space-2) var(--bd-space-3);

  @media (--tablet-down) {
    display: flex;
  }
}

.logo-link {
  display: flex;
  flex: 1;
  justify-content: center;
}

.logo {
  height: 1.8rem;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}
</style>
