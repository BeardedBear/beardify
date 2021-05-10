<template>
  <div class="topbar">
    <div id="nav">
      <img class="logo" src="/img/logo.svg" alt="" />
      <div class="navigation">
        <button class="navigation__item" @click="previous()"><i class="icon-arrow-left"></i></button>
        <button class="navigation__item" @click="next()"><i class="icon-arrow-right"></i></button>
      </div>
      <!-- <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link> -->
      <!-- <router-link to="/login">Login</router-link> -->
    </div>
    <Search />
    <div>
      <div v-if="store.state.auth.me.display_name === ''">
        <a :href="connectUrl">LOGME</a> - {{ store.state.auth.me }}
      </div>
      <div v-else>
        <Cover size="large" :images="store.state.auth.me.images" className="avatar" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { connectUrl } from "../api";
import { useStore } from "vuex";
import { PlayerActions } from "./player/PlayerStore";
import { AuthActions } from "../views/auth/AuthStore";
import type { RootState } from "../@types/RootState";
import { defineComponent } from "vue";
import Search from "./search/Search.vue"
import Cover from "./Cover.vue"
import router from "../router";

export default defineComponent({
  components : {Search, Cover},
  setup() {
    const store = useStore<RootState>();

    function getDeviceList(): void {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
    }

    function previous() {
      router.go(-1)
    }

    function next() {
      router.go(1)
    }

    function refresh(): void {
      store.dispatch(`auth/${AuthActions.refresh}`);
    }

    return { store, getDeviceList, refresh, connectUrl, previous, next };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.navigation {
  $radius: 4px;

  &__item {
    border: 0;
    font-size: 1.2rem;
    padding: 8px 7px;
    line-height: 1;
    background-color: $bg-color-light;
    cursor: pointer;
    color: currentColor;

    &:hover {
      background-color: $bg-color-lighter;
    }

    &:active {
      background-color: rgba($bg-color-lighter, 0.8);
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
}
.logo {
  height: 30px;
  display: block;
  margin-right: 15px;
}
.topbar {
  display: flex;
  justify-content: space-between;
  background: $bg-color;
  padding: 15px;
  align-items: center;
  gap: 30px;
}

#nav {
  display: flex;
  gap: 15px;
  align-items: center;

  a {
    font-weight: bold;
    color: $bg-color-lighter;

    &.router-link-exact-active {
      color: $primary-color;
    }
  }
}
</style>
