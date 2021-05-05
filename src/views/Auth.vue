<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { Mutations, PlayerActions } from "../components/PlayerStore";
import router from "../router";
import { AuthActions } from "../views/AuthStore";

export default defineComponent({
  name: "Auth",
  props: ["query"],
  setup(props) {
    const store = useStore();

    onMounted(() => {
      store.dispatch(`auth/${AuthActions.auth}`, props.query).then(() => router.push("/"));

      // Keep app active
      setInterval(() => {
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
        store.commit(`player/${Mutations.SET_THIS_DEVICE}`, store.state.player.devices.thisDevice);
        store.dispatch(`auth/${AuthActions.refresh}`);
      }, 300000);
    });

    return { store };
  },
});
</script>
