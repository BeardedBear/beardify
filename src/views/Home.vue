<template>
  <div class="home">
    <div v-for="(item, i) in store.state.player.playlist" :key="i">
      <div @click="goto(i)" class="item" :class="{ active: item.label === current.item.label }">
        {{ item.label }}
      </div>
    </div>
    <div>
      <b>accessToken</b> :{{ store.state.auth.auth.accessToken }}<br /><br />
      <b>refreshToken</b> :{{ store.state.auth.auth.refreshToken }}<br /><br />
      <b>code</b> :{{ store.state.auth.auth.code }}<br /><br />
      <b>codeVerifier</b> :{{ store.state.auth.auth.codeVerifier }}<br /><br />
      <b>codeChallenge</b> :{{ store.state.auth.auth.codeChallenge }}<br /><br />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import { useStore } from "vuex";
import { PlayerActions } from "@/components/PlayerStore";
import { instance } from "@/api";

/* eslint-disable @typescript-eslint/camelcase */
export default defineComponent({
  name: "Home",
  setup() {
    const current = useStore<RootState>().state.player.currentlyPlaying;
    const store = useStore<RootState>();
    const playlist = useStore<RootState>().state.player.playlist;
    const plyr: any = inject("plyr", ref(null));

    const goto = (id: number) => {
      store.dispatch(`player/${PlayerActions.next}`, id).then(() => {
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
        if (current.index < playlist.length) {
          if (current.item.type === "speak") {
            instance.put("me/player/pause", {
              device_id: store.state.player.devices.thisDevice
            });
            plyr.value.player.source = playlist[current.index].data;
            plyr.value.player.play();
          } else {
            plyr.value.player.stop();
            instance.put(`me/player/play?device_id=${store.state.player.devices.thisDevice}`, {
              uris: [current.item.uri],
              position_ms: 1
            });
          }
        }
      });
    };

    return { goto, store, playlist, current };
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  line-break: anywhere;
}

.item {
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: rgba(lightgrey, 0.3);
  }

  &.active {
    background: rgb(144, 216, 238);
  }
}
</style>
