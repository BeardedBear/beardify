<template>
  <div class="player">
    <div>
      <div class="meta">
        <div class="controls">
          <div>
            <button class="controls__btn" v-if="current.track.paused" @click="goPlay()">
              <i class="icon-play"></i>
            </button>
            <button class="controls__btn" v-else @click="goPause()">
              <i class="icon-pause"></i>
            </button>
            <button class="controls__btn" @click="goNext()">
              <i class="icon-skip-forward"></i>
            </button>
          </div>
          <div>{{ timecode(current.track.position) }} / {{ timecode(current.track.duration) }}</div>
          <div></div>
        </div>

        <div>
          <div v-if="current.track.track_window.current_track.name !== ''" class="meta__what">
            <img :src="current.track.track_window.current_track.album.images[1].url" />
            <div>
              <div>
                <span v-for="(artist, _, index) in current.track.track_window.current_track.artists" :key="index">
                  <span class="artistname">{{ artist.name }}</span>
                  <span v-if="current.track.track_window.current_track.artists.length === index">,</span>
                </span>
                ·
                <span class="trackname">{{ current.track.track_window.current_track.name }}</span>
              </div>
              <div class="album">{{ current.track.track_window.current_track.album.name }}</div>
            </div>
          </div>
          <div v-else>Pas de morceaux de lancé</div>
        </div>

        <div class="options">
          <div v-if="store.state.player.devices.list.length">
            <button
              type="button"
              v-for="(device, _, index) in store.state.player.devices.list"
              :key="index"
              class="button button--x-small"
              :class="{ 'button--primary': device === store.state.player.devices.activeDevice }"
              @click="setDevice(device)"
            >
              {{ device.name }}
            </button>
          </div>
          <div v-else><button class="button button--primary" @click="getDevices()"></button></div>
        </div>
      </div>

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
import { ref, onMounted, defineComponent } from "vue";
import { useStore } from "vuex";
import { instance } from "../api";
import { Mutations, PlayerActions } from "../components/PlayerStore";
import { timecode } from "../helpers/date";
import type { RootState } from "../@types/rootStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const current = useStore<RootState>().state.player.currentlyPlaying;
    const progresss = ref();
    const perc = ref();
    const time = ref();

    function getDevices() {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
    }

    function setDevice(id: UserDevice) {
      store.dispatch(`player/${PlayerActions.setDevice}`, id);
    }

    function goPlay() {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.activeDevice,
      }).catch((error) => {
        console.log(error);
      });
    }

    function goNext() {
      instance.post("me/player/next");
    }

    function goPause() {
      instance.put("me/player/pause", {
        device_id: store.state.player.devices.activeDevice,
      });
    }

    addEventListener("playerStateChanged", ((detail: CustomEvent) => {
      store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, {
        duration: detail.detail.duration,
        position: detail.detail.position,
        paused: detail.detail.paused,
        repeatMode: detail.detail.repeat_mode,
        shuffle: detail.detail.shuffle,
        track_window: detail.detail.track_window,
      });
    }) as { (evt: Event): void });

    onMounted(() => {
      progresss.value.addEventListener("mousemove", (e: MouseEvent) => {
        const positionInPercent = (e.clientX / progresss.value.clientWidth) * 100;
        const duration = (current.track.duration / 100) * positionInPercent;
        perc.value = positionInPercent;
        time.value = timecode(duration);
      });

      progresss.value.addEventListener("click", (e: MouseEvent) => {
        const positionInPercent = (e.clientX / progresss.value.clientWidth) * 100;
        const duration = (current.track.duration / 100) * positionInPercent;
        instance.put(`me/player/seek?position_ms=${Math.round(duration)}`);
      });
    });

    return { current, store, getDevices, setDevice, goPlay, goNext, goPause, perc, time, timecode, progresss };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

@keyframes popSeek {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.player {
  background: $bg-color;
}

.trackname {
  font-style: italic;
}

.artistname {
  font-weight: 700;
}
.album {
  opacity: 0.5;
  font-style: italic;
}

.controls {
  display: flex;
  gap: 20px;
  align-items: center;

  &__btn {
    border: 0;
    background-color: transparent;
    font-size: 1.8rem;
    color: currentColor;
    border-radius: 5px;
    margin-right: 5px;
    cursor: pointer;
    padding: 5px 7px;

    &:hover {
      background-color: $bg-color-light;
      color: white;
    }
  }
}
.options {
  text-align: right;
}
.meta {
  $sidewidth: 250px;
  display: grid;
  grid-template-columns: $sidewidth auto $sidewidth;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;

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
  background: $bg-color-light;
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
      background: $primary-color;
      color: rgba(white, 0.8);
      padding: 5px 10px;
      right: 0;
      border: 1px solid $primary-color-light;
      border-radius: 3px;
      transform: translateX(50%);
    }
  }

  .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: #6243b0;
    transition: width linear 0.5s;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
