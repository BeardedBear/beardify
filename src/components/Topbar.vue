<template>
  <div class="topbar">
    <div id="nav">
      <router-link to="/"><img class="logo" src="/img/logo.svg" /></router-link>
      <div class="navigation">
        <button class="navigation__item" @click="router.go(-1)"><i class="icon-arrow-left" /></button>
        <button class="navigation__item" @click="router.go(1)">
          <i class="icon-arrow-right" />
        </button>
      </div>
    </div>
    <Search />
    <div>
      <div v-if="authStore.me !== null">
        <Cover size="large" :images="authStore.me?.images" class="avatar" @click="configStore.open()" />
        <Config />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Search from "./search/Search.vue";
import Cover from "./Cover.vue";
import router from "../router";
import Config from "./config/Config.vue";
import { useAuth } from "../views/auth/AuthStore";
import { useConfig } from "./config/ConfigStore";

const authStore = useAuth();
const configStore = useConfig();
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
    color: currentColor;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0.5rem;

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
  $size: 2rem;

  border-radius: $size;
  display: block;
  height: $size;
  margin-left: 1rem;
  width: $size;
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
