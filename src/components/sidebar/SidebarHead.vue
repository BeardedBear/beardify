<template>
  <div class="topbar">
    <router-link to="/">
      <img alt="Beardify home" class="logo" src="/img/logo.svg" />
    </router-link>
    <BdButtonGroup full class="navigation">
      <BdTooltip bare content="Go back">
        <BdButton icon-only label="Go back" @click="router.go(-1)">
          <i aria-hidden="true" class="icon-arrow-left" />
        </BdButton>
      </BdTooltip>
      <BdTooltip bare content="Go forward">
        <BdButton icon-only label="Go forward" @click="router.go(1)">
          <i aria-hidden="true" class="icon-arrow-right" />
        </BdButton>
      </BdTooltip>
    </BdButtonGroup>
    <!-- Pas `bare` : `.topbar > :not(.navigation)` vise l'enfant direct, qui doit
         donc garder une boîte pour recevoir son `flex-shrink: 0`. -->
    <BdTooltip content="Search">
      <BdButton icon-only label="Search" @click="dialogStore.open({ type: 'search' })">
        <i aria-hidden="true" class="icon-search" />
      </BdButton>
    </BdTooltip>
    <BdDropdown v-if="authStore.me !== null" v-model="configOpen" placement="bottom-end">
      <template #trigger>
        <div class="avatar">
          <Cover :images="authStore.me?.images" class="avatar-image bd-squircle" size="large" />
          <i class="icon icon-chevron-down bd-font-bold" />
        </div>
      </template>
      <Config />
    </BdDropdown>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdButtonGroup, BdDropdown, BdTooltip } from "bearded-ui";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import Config from "@/components/config/ConfigIndex.vue";
import { useConfig } from "@/components/config/ConfigStore";
import { useDialog } from "@/components/dialog/DialogStore";
import Cover from "@/components/ui/AlbumCover.vue";
import router from "@/router";
import { useAuth } from "@/views/auth/AuthStore";

const authStore = useAuth();
const configStore = useConfig();
const dialogStore = useDialog();

// The store owns the panel (logging out closes it from AuthStore); BdDropdown
// only reports the gestures it handles itself — outside click, Escape.
const configOpen = computed<boolean>({
  get: () => configStore.show,
  set: (value) => (value ? configStore.open() : configStore.close()),
});
</script>

<style scoped>

.topbar {
  align-items: center;
  background: var(--bd-bg);
  display: flex;
  justify-content: space-between;
  padding: var(--bd-space-4);
  position: relative;

  /* Seule la navigation absorbe la place restante : sans ça les autres items
     rétrécissent aussi, et l'avatar est écrasé par le `max-width: 100%` que
     bearded-ui pose sur les images. */
  & > :not(.navigation) {
    flex-shrink: 0;
  }
}

.navigation {
  margin-left: var(--bd-space-4);
  margin-right: var(--bd-space-4);
}

.avatar {
  cursor: pointer;
  margin-left: var(--bd-space-4);
  position: relative;
  transition: transform var(--bd-transition);
  will-change: transform;

  &:hover {
    transform: scale(1.15);
  }

  .icon {
    --icon-offset: -0.3rem;

    background-color: var(--bd-font-color);
    border: 0.2rem solid var(--bd-bg);
    border-radius: var(--bd-radius-full);
    bottom: var(--icon-offset);
    color: var(--bd-bg);
    font-size: var(--bd-font-size-xs);
    position: absolute;
    right: var(--icon-offset);
  }
}

.avatar-image {
  --avatar-image-size: 2.3rem;

  border-radius: var(--avatar-image-size);
  display: block;
  height: var(--avatar-image-size);
  width: var(--avatar-image-size);
}

.logo {
  display: block;
  height: 2rem;
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
}

#nav {
  align-items: center;
  display: flex;

  a {
    color: var(--bd-bg-light);
    font-variation-settings: var(--bd-font-variation-settings-bold);
    font-weight: var(--bd-weight-bold-fallback);

    &.router-link-exact-active {
      color: var(--bd-primary);
    }
  }
}
</style>
