<template>
  <div class="topbar">
    <router-link to="/">
      <img class="logo" src="/img/logo.svg" />
    </router-link>
    <BdButtonGroup full class="navigation">
      <BdButton label="Go back" icon-only @click="router.go(-1)">
        <i aria-hidden="true" class="icon-arrow-left" />
      </BdButton>
      <BdButton label="Go forward" icon-only @click="router.go(1)">
        <i aria-hidden="true" class="icon-arrow-right" />
      </BdButton>
    </BdButtonGroup>
    <BdButton label="Search" icon-only @click="dialogStore.open({ type: 'search' })">
      <i aria-hidden="true" class="icon-search" />
    </BdButton>
    <BdDropdown v-if="authStore.me !== null" v-model="configOpen" placement="bottom-end">
      <template #trigger>
        <div class="avatar">
          <Cover :images="authStore.me?.images" class="avatar-image squircle" size="large" />
          <i class="icon icon-chevron-down font-bold" />
        </div>
      </template>
      <Config />
    </BdDropdown>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdButtonGroup, BdDropdown } from "bearded-ui";
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
  background: var(--bg-color);
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  position: relative;

  /* Seule la navigation absorbe la place restante : sans ça les autres items
     rétrécissent aussi, et l'avatar est écrasé par le `max-width: 100%` que
     bearded-ui pose sur les images. */
  & > :not(.navigation) {
    flex-shrink: 0;
  }
}

.navigation {
  margin-left: 1rem;
  margin-right: 1rem;
}

.avatar {
  cursor: pointer;
  margin-left: 1rem;
  position: relative;
  transition: transform 0.2s ease;
  will-change: transform;

  &:hover {
    transform: scale(1.15);
  }

  .icon {
    --icon-offset: -0.3rem;

    background-color: var(--font-color);
    border: 0.2rem solid var(--bg-color);
    border-radius: 2rem;
    bottom: var(--icon-offset);
    color: var(--bg-color);
    font-size: var(--font-size-xs);
    position: absolute;
    right: var(--icon-offset);
  }
}

.avatar-image {
  --avatar-image-size: 2rem;

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
    color: var(--bg-color-light);
    font-variation-settings: var(--font-variation-settings-bold);
    font-weight: var(--font-weight-bold);

    &.router-link-exact-active {
      color: var(--primary-color);
    }
  }
}
</style>
