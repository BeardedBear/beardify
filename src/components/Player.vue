<template>
  <div class="player">
    <!-- <button @click="goNext((current.index += 1))">NEXT</button> -->

    <!-- <div>
      {{ (current.track.position / current.track.duration) * 100 }}
    </div> -->

    <div>
      <div class="meta">
        <div>
          <button @click="goPlay">PLAY</button>
          <button @click="goPause">PAUSE</button>
          <div>{{ timecode(current.track.position) }} / {{ timecode(current.track.duration) }}</div>
          <div></div>
        </div>

        <div class="meta__what">
          <img :src="current.track.trackWindow.current_track.album.images[1].url" alt="" />
          <div>
            <div>
              <span v-for="(artist, _, index) in current.track.trackWindow.current_track.artists" :key="index">
                {{ artist.name }}, </span
              >- {{ current.track.trackWindow.current_track.name }}
            </div>
            <div>{{ current.track.trackWindow.current_track.album.name }}</div>
          </div>
        </div>
        <div>coucou</div>
      </div>

      <!-- <div v-for="(cover, _, index) in current.track.trackWindow.current_track.album.images" :key="index">
        <img :src="cover.url" alt="" />
      </div> -->

      <div ref="progresss" class="progress">
        <div class="bar" :style="`width:${(current.track.position / current.track.duration) * 100}%`"></div>
        <div class="seek" :style="`width:${perc}%`">
          <div class="time">{{ time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watchEffect } from "vue";
import { useStore } from "vuex";
import { instance } from "@/api";
import { Mutations } from "@/components/PlayerStore";
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
        store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, {
          duration: detail.detail.duration,
          position: detail.detail.position,
          trackWindow: detail.detail.trackWindow
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

    return { store, current, playlist, goPlay, goPause, progresss, perc, time, timecode };
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

.player {
  background: #1b1e26;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;

  &__what {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      height: 50px;
    }
  }
}

.progress {
  background: #262a36;
  height: 10px;
  position: relative;
  cursor: pointer;
  flex: 1;

  .seek {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: rgba(white, 0.2);
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
    background: #6243b0;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
