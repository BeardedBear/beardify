<template>
  <div class="topbar">
    <router-link to="/">
      <img class="logo" src="/img/logo.svg" />
    </router-link>
    <div class="navigation">
      <ButtonIndex icon-only variant="full" @click="router.go(-1)">
        <i class="icon-arrow-left" />
      </ButtonIndex>
      <ButtonIndex icon-only variant="full" @click="router.go(1)">
        <i class="icon-arrow-right" />
      </ButtonIndex>
    </div>
    <ButtonIndex icon-only @click="dialogStore.open({ type: 'search' })">
      <i class="icon-search" />
    </ButtonIndex>
    <div>
      <div v-if="authStore.me !== null">
        <div class="avatar" @click="configStore.open()">
          <Cover :images="authStore.me?.images" class="avatar-image squircle" size="large" />
          <i class="icon icon-chevron-down font-bold" />
        </div>
        <Config />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import Config from "@/components/config/ConfigIndex.vue";
import { useConfig } from "@/components/config/ConfigStore";
import { useDialog } from "@/components/dialog/DialogStore";
import Cover from "@/components/ui/AlbumCover.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import router from "@/router";
import { useAuth } from "@/views/auth/AuthStore";

const authStore = useAuth();
const configStore = useConfig();
const dialogStore = useDialog();
</script>

<style scoped>

.topbar {
  align-items: center;
  background: var(--bg-color);
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
}

.navigation {
  --navigation-radius: 1rem;

  display: flex;
  margin-left: 1rem;
  margin-right: 1rem;
  width: 100%;

  button {
    &:first-of-type {
      border-radius: var(--navigation-radius) 0 0 var(--navigation-radius);
    }

    &:last-of-type {
      border-radius: 0 var(--navigation-radius) var(--navigation-radius) 0;
    }
  }
}

.avatar {
  cursor: pointer;
  margin-left: 1rem;
  position: relative;
  transition: 0.2s;
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
