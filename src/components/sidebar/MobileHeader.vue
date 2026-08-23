<template>
  <div class="mobile-header">
    <BdButton icon-only @click="sidebarStore.toggle()">
      <i class="icon-menu" />
    </BdButton>
    <router-link to="/" class="logo-link">
      <img class="logo" src="/img/logo.svg" />
    </router-link>
    <BdButton icon-only @click="dialogStore.open({ type: 'search' })">
      <i class="icon-search" />
    </BdButton>
  </div>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";
import { RouterLink } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import { useSidebar } from "@/components/sidebar/SidebarStore";

const sidebarStore = useSidebar();
const dialogStore = useDialog();
</script>

<style scoped>

.mobile-header {
  align-items: center;
  background: var(--bg-color-dark);
  display: none;
  justify-content: space-between;
  padding: 0.5rem 0.8rem;

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
