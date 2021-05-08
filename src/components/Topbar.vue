<template>
  <div class="topbar">
    <div id="nav">
      <img class="logo" src="/img/logo.svg" alt="" />
      <!-- <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link> -->
      <router-link to="/login">Login</router-link>
    </div>
    <Search />
    <div>
      <div v-if="store.state.auth.me.displayName === ''">
        <a :href="connectUrl">LOGME</a> - {{ store.state.auth.me.displayName }}
      </div>
      <div v-else>
        {{ store.state.auth.me.displayName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { connectUrl } from "../api";
import { useStore } from "vuex";
import { PlayerActions } from "../components/PlayerStore";
import { AuthActions } from "../views/AuthStore";
import type { RootState } from "../@types/rootStore";
import { defineComponent } from "vue";
import Search from "./search/Search.vue"

export default defineComponent({
  components : {Search},
  setup() {
    const store = useStore<RootState>();

    function getDeviceList(): void {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
    }
    function refresh(): void {
      store.dispatch(`auth/${AuthActions.refresh}`);
    }

    return { store, getDeviceList, refresh, connectUrl };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.logo {
  height: 30px;
  display: block;
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
