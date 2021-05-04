<template>
  <div class="player">
    <!-- <button @click="goNext((current.index += 1))">NEXT</button> -->
    <button @click="goPlay">PLAY</button>
    <button @click="goPause">PAUSE</button>
    <div>{{ current.track }}</div>
    <div>
      {{ (current.track.position / current.track.duration) * 100 }}
    </div>

    <div>
      <div ref="progresss" class="progress">
        <div class="bar" :style="`width:${(current.track.position / current.track.duration) * 100}%`"></div>
        <div class="seek" :style="`width:${perc}%`">
          <div class="time">{{ time }}</div>
        </div>
      </div>
      <div>{{ current.item.label }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watchEffect } from "vue";
import { useStore } from "vuex";
import { instance } from "@/api";
import { PlayerActions } from "@/components/PlayerStore";
import { timecode } from "@/helpers/date";

/* eslint-disable @typescript-eslint/camelcase */
export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const current = useStore<RootState>().state.player.currentlyPlaying;
    const playlist = useStore<RootState>().state.player.playlist;
    const progresss = ref();
    const plyr = inject("plyr", ref(null));
    const perc = ref();
    const time = ref();

    const goPlay = () => {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.thisDevice
      });
    };

    const goPause = () => {
      instance.put("me/player/pause", {
        device_id: store.state.player.devices.thisDevice
      });
    };

    // const goNext = (id: number) => {
    //   store.dispatch(`player/${PlayerActions.next}`, id).then(() => {
    //     store.dispatch(`player/${PlayerActions.getDeviceList}`);
    //     if (current.index < playlist.length) {
    //       if (current.item.type === "speak") {
    //         instance.put("me/player/pause", {
    //           device_id: store.state.player.devices.thisDevice
    //         });
    //         plyr.value.player.source = playlist[current.index].data;
    //         plyr.value.player.play();
    //       } else {
    //         plyr.value.player.stop();
    //         instance.put(`me/player/play?device_id=${store.state.player.devices.thisDevice}`, {
    //           uris: [current.item.uri],
    //           position_ms: 1
    //         });
    //       }
    //     }
    //   });
    // };

    window.addEventListener(
      "playerStateChanged",
      ((detail: CustomEvent) => {
        // if (current.index < playlist.length) goNext();
        store.dispatch(`player/${PlayerActions.playerStateChanged}`, {
          duration: detail.detail.duration,
          position: detail.detail.position
        });
      }) as EventListener
      // { once: true }
    );

    watchEffect(() => {
      if (plyr.value) {
        // plyr.value.player.on("timeupdate", (e: CustomEvent) => {
        //   store.dispatch(`player/${PlayerActions.playerStateChanged}`, {
        //     duration: e.detail.plyr.duration * 1000,
        //     position: e.detail.plyr.currentTime * 1000
        //   });
        // });

        // plyr.value.player.on("ended", () => {
        //   if (current.index < playlist.length) goNext((current.index += 1));
        // });

        progresss.value.addEventListener("mousemove", (e: MouseEvent) => {
          const positionInPercent = (e.clientX / progresss.value.clientWidth) * 100;
          const duration = (current.track.duration / 100) * positionInPercent;
          perc.value = positionInPercent;
          time.value = timecode(duration);
        });

        progresss.value.addEventListener("click", (e: MouseEvent) => {
          const positionInPercent = (e.clientX / progresss.value.clientWidth) * 100;
          const duration = (current.track.duration / 100) * positionInPercent;
          instance.put(
            `me/player/seek?position_ms=${Math.round(duration)}&device_id=${store.state.player.devices.thisDevice}`
          );
        });
      }
    });

    return { store, current, playlist, goPlay, goPause, progresss, perc, time };
  }
});
</script>

<style lang="scss" scoped>
@keyframes popSeek {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.progress {
  background: rgb(179, 179, 179);
  height: 20px;
  position: relative;
  cursor: pointer;

  .seek {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: rgba(black, 0.2);
    display: none;
    animation: popSeek 0.2s ease 0s both;

    .time {
      position: absolute;
      bottom: calc(100% + 5px);
      background: white;
      color: black;
      padding: 5px 10px;
      right: 0;
      border: 1px solid #cccccc;
      border-radius: 5px;
      transform: translateX(50%);
    }
  }

  .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: rgb(144, 216, 238);
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
