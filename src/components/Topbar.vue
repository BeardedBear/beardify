<template>
  <div class="topbar">
    <div id="nav">
      <img src="/img/logo.svg" alt="" />
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <div>
      <span
        v-for="device in store.state.player.devices.list"
        :key="device.name"
        :class="{ active: device.id === store.state.player.devices.thisDevice }"
      >
        {{ device.name }}
      </span>
    </div>
    <div>
      <div v-if="store.state.auth.me.displayName === ''">
        <a :href="connectUrl">LOGME</a> - {{ store.state.auth.me.displayName }}
      </div>
      <div v-else>
        <button @click="refresh()">refresh</button><a :href="connectUrl">LOGME</a> -
        {{ store.state.auth.me.displayName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { connectUrl } from "@/api";
import { useStore } from "vuex";
import { PlayerActions } from "@/components/PlayerStore";
import { AuthActions } from "@/views/AuthStore";
import { RootState } from "@/@types/rootStore";

export default defineComponent({
  name: "Topbar",
  setup() {
    const store = useStore<RootState>();

    const getDeviceList = () => store.dispatch(`player/${PlayerActions.getDeviceList}`);
    function refresh() {
      store.dispatch(`auth/${AuthActions.refresh}`);
    }

    return { connectUrl, store, getDeviceList, refresh };
  }
});
</script>

<style lang="scss" scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  background: #1b1e26;
  padding: 15px;
  align-items: center;
}

#nav {
  display: flex;
  gap: 15px;
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

span {
  margin-right: 10px;
  &.active {
    color: white;
    background: green;
  }
}
</style>
