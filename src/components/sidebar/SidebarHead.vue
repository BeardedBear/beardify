<template>
  <div class="topbar">
    <router-link to="/"><img class="logo" src="/img/logo.svg" /></router-link>
    <div class="navigation">
      <ButtonIndex icon-only @click="router.go(-1)" variant="full">
        <i class="icon-arrow-left" />
      </ButtonIndex>
      <ButtonIndex icon-only @click="router.go(1)" variant="full">
        <i class="icon-arrow-right" />
      </ButtonIndex>
    </div>
    <ButtonIndex icon-only @click="dialogStore.open({ type: 'search' })">
      <i class="icon-search" />
    </ButtonIndex>
    <div>
      <div v-if="authStore.me !== null">
        <div @click="configStore.open()" class="avatar">
          <Cover :images="authStore.me?.images" class="avatar-image" size="large" />
          <i class="icon icon-chevron-down"></i>
        </div>
        <Config />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import router from "@/router";
import { useAuth } from "@/views/auth/AuthStore";
import Cover from "@/components/ui/AlbumCover.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Config from "@/components/config/ConfigIndex.vue";
import { useConfig } from "@/components/config/ConfigStore";
import { useDialog } from "@/components/dialog/DialogStore";

const authStore = useAuth();
const configStore = useConfig();
const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as mixins;

.topbar {
  align-items: center;
  background: var(--bg-color);
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
}

.navigation {
  $radius: 1rem;

  display: flex;
  margin-left: 1rem;
  margin-right: 1rem;
  width: 100%;

  button {
    &:first-of-type {
      border-radius: $radius 0 0 $radius;
    }

    &:last-of-type {
      border-radius: 0 $radius $radius 0;
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

  &-image {
    $size: 2rem;

    border-radius: $size;
    display: block;
    height: $size;
    width: $size;

    @include mixins.squircle;
  }

  .icon {
    $offset: -0.3rem;

    background-color: var(--font-color);
    border: 0.2rem solid var(--bg-color);
    border-radius: 2rem;
    bottom: $offset;
    color: var(--bg-color);
    font-size: 0.7rem;
    font-weight: bold;
    position: absolute;
    right: $offset;
  }
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
    font-weight: bold;

    &.router-link-exact-active {
      color: var(--primary-color);
    }
  }
}
</style>
