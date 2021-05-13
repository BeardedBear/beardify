<template>
  <div class="topbar">
    <div id="nav">
      <img class="logo" src="/img/logo.svg" />
      <div class="navigation">
        <button class="navigation__item" @click="previous()">
          <i class="icon-arrow-left"></i>
        </button>
        <button class="navigation__item" @click="next()">
          <i class="icon-arrow-right"></i>
        </button>
      </div>
    </div>
    <Search />
    <div>
      <div v-if="store.state.auth.me.display_name === ''">
        <a :href="connectUrl">LOGME</a>
        - {{ store.state.auth.me }}
      </div>
      <div v-else>
        <Cover size="large" :images="store.state.auth.me.images" class="avatar" @click="openConfig()" />
        <Config v-if="store.state.config.show" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { connectUrl } from "../api";
import { useStore } from "vuex";
import type { RootState } from "../@types/RootState";
import { defineComponent, onMounted } from "vue";
import Search from "./search/Search.vue"
import Cover from "./Cover.vue"
import router from "../router";
import Config from "./config/Config.vue"
import { Mutations } from "./config/ConfigStore"

export default defineComponent({
  components: { Search, Cover, Config },
  setup() {
    const store = useStore<RootState>();

    function previous() {
      router.go(-1)
    }

    function next() {
      router.go(1)
    }

    function openConfig() {
      store.commit(`config/${Mutations.OPEN}`)
    }

    onMounted(() => {
      addEventListener("click", (e: any) => {
        const test = e.composedPath().filter((b :HTMLElement) => b.className === "config").length
        if (!test) store.commit(`config/${Mutations.CLOSE}`)
      })
      document.querySelector(".avatar")?.addEventListener("click", (e) => e.stopPropagation())
    })


    return { store, connectUrl, previous, next, openConfig };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.topbar {
  display: flex;
  justify-content: space-between;
  background: var(--bg-color);
  padding: 15px;
  align-items: center;
  position: relative;
}
.navigation {
  $radius: 4px;
  margin-right: 15px;
  margin-left: 15px;

  &__item {
    border: 0;
    font-size: 1.2rem;
    padding: 8px 7px;
    line-height: 1;
    background-color: var(--bg-color-light);
    cursor: pointer;
    color: currentColor;

    &:hover {
      background-color: var(--bg-color-lighter);
    }

    &:active {
      background-color: var(--bg-color);
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
  $size: 35px;
  border-radius: $size;
  height: $size;
  width: $size;
  display: block;
  margin-left: 15px;
}
.logo {
  height: 30px;
  display: block;
  opacity: 0.5;
}

#nav {
  display: flex;
  align-items: center;

  a {
    font-weight: bold;
    color: var(--bg-color-light);

    &.router-link-exact-active {
      color: var(--primary-color);
    }
  }
}
</style>
