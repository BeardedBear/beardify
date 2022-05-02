<template>
  <div class="topbar">
    <router-link to="/"><img class="logo" src="/img/logo.svg" /></router-link>
    <div class="navigation">
      <button class="navigation__item" @click="router.go(-1)"><i class="icon-arrow-left" /></button>
      <button class="navigation__item" @click="router.go(1)">
        <i class="icon-arrow-right" />
      </button>
    </div>
    <button class="button" @click="dialogStore.open({ type: 'search' })">
      <i class="icon-search" />
    </button>
    <div>
      <div v-if="authStore.me !== null">
        <div class="avatar" @click="configStore.open()">
          <Cover size="large" :images="authStore.me?.images" class="avatar-image" />
          <i class="icon icon-chevron-down"></i>
        </div>
        <Config />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Cover from "./AlbumCover.vue";
import router from "../router";
import Config from "./config/ConfigIndex.vue";
import { useAuth } from "../views/auth/AuthStore";
import { useConfig } from "./config/ConfigStore";
import { useDialog } from "./dialog/DialogStore";
import { RouterLink } from "vue-router";

const authStore = useAuth();
const configStore = useConfig();
const dialogStore = useDialog();
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.topbar {
  align-items: center;
  background: var(--bg-color);
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
}

.navigation {
  $radius: 0.3rem;

  margin-left: 1rem;
  margin-right: 1rem;

  &__item {
    background-color: var(--bg-color-light);
    border: 0;
    color: currentcolor;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0.5rem 1rem;

    &:hover {
      background-color: var(--bg-color-lighter);
    }

    &:active {
      background-color: var(--bg-color-lighter);
    }

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
