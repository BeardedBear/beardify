<template>
  <div class="mobile-header">
    <ButtonIndex icon-only @click="sidebarStore.toggle()">
      <i class="icon-menu" />
    </ButtonIndex>
    <router-link to="/" class="logo-link">
      <img class="logo" src="/img/logo.svg" />
    </router-link>
    <ButtonIndex icon-only @click="dialogStore.open({ type: 'search' })">
      <i class="icon-search" />
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";

const sidebarStore = useSidebar();
const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;

.mobile-header {
  align-items: center;
  background: var(--bg-color-dark);
  display: none;
  justify-content: space-between;
  padding: 0.5rem 0.8rem;

  @include responsive.tablet-down {
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
