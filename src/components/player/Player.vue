<template>
  <div class="player">
    <div>
      <div class="meta">
        <div class="controls">
          <div>
            <button class="controls__btn" v-if="!store.state.player.currentlyPlaying.is_playing" @click="goPlay()">
              <i class="icon-play"></i>
            </button>
            <button class="controls__btn" v-else @click="goPause()">
              <i class="icon-pause"></i>
            </button>
            <button class="controls__btn" @click="goNext()">
              <i class="icon-skip-forward"></i>
            </button>
          </div>
          <div v-if="store.state.player.currentlyPlaying.progress_ms">
            {{ timecode(store.state.player.currentlyPlaying.progress_ms) }} /
            {{ timecode(store.state.player.currentlyPlaying.item.duration_ms) }}
          </div>
          <div></div>
        </div>

        <div>
          <div v-if="store.state.player.currentlyPlaying.item.name !== null" class="meta__what">
            <router-link :to="`/album/${store.state.player.currentlyPlaying.item.album.id}`">
              <Cover size="small" :images="store.state.player.currentlyPlaying.item.album.images" className="cover" />
            </router-link>
            <div>
              <div>
                <ArtistList :artistList="store.state.player.currentlyPlaying.item.album.artists" />
                ·
                <span class="trackname">{{ store.state.player.currentlyPlaying.item.name }}</span>
              </div>
              <div class="album">{{ store.state.player.currentlyPlaying.item.album.name }}</div>
            </div>
          </div>
          <div v-else>Pas de morceaux de lancé</div>
        </div>

        <div class="options">
          <div>
            <div ref="refVolume" class="volume" @click="setVolume()">
              <div
                class="volume__cursor"
                :style="{ width: store.state.player.devices.activeDevice.volume_percent + '%' }"
              ></div>
              <div class="volume__hover" :style="{ width: volume + '%' }"></div>
            </div>
          </div>
          <div v-if="store.state.player.devices.list.length">
            <button
              type="button"
              v-for="(device, _, index) in store.state.player.devices.list"
              :key="index"
              class="button button--x-small"
              :class="{ 'button--primary': device.id === store.state.player.devices.activeDevice.id }"
              @click="setDevice(device)"
            >
              {{ device.name }}
            </button>
          </div>
          <div v-else><button class="button button--primary" @click="getDevices()"></button></div>
        </div>
      </div>

      <div ref="progresss" class="progress">
        <div
          class="bar"
          :style="
            `width:${(store.state.player.currentlyPlaying.progress_ms /
              store.state.player.currentlyPlaying.item.duration_ms) *
              100}%`
          "
        ></div>
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
import { instance } from "../../api";
import { Mutations, PlayerActions } from "./../player/PlayerStore";
import { RootState } from "../../@types/RootState";
import ArtistList from "../ArtistList.vue";
import { Device } from "../../@types/Device";
import Cover from "../Cover.vue";
import { timecode } from "../../helpers/date";

export default defineComponent({
  components: { ArtistList, Cover },
  setup() {
    const store = useStore<RootState>();
    const current = useStore<RootState>().state.player.currentlyPlaying;
    const progresss = ref();
    const perc = ref();
    const time = ref();
    const refVolume = ref();
    const volume = ref(0);

    function getDevices() {
      store.dispatch(`player/${PlayerActions.getDeviceList}`);
    }

    function setDevice(id: Device) {
      store.dispatch(`player/${PlayerActions.setDevice}`, id);
    }

    function goPlay() {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.activeDevice
      });
    }

    function goNext() {
      instance.post("me/player/next");
    }

    function goPause() {
      instance.put("me/player/pause", {
        device_id: store.state.player.devices.activeDevice
      });
    }

    function setVolume() {
      store.dispatch(`player/${PlayerActions.setVolume}`, volume.value);
    }

    addEventListener("playerStateChanged", ((CE: CustomEvent<Spotify.PlaybackState>) => {
      store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, CE.detail);
    }) as { (evt: Event): void });

    onMounted(() => {
      refVolume.value.addEventListener("mousemove", (e: MouseEvent) => {
        volume.value = e.offsetX;
      });

      progresss.value.addEventListener("mousemove", (e: MouseEvent) => {
        const positionInPercent = (e.clientX / progresss.value.clientWidth) * 100;
        const duration = (store.state.player.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
        perc.value = positionInPercent;
        time.value = timecode(duration);
      });

      progresss.value.addEventListener("click", (e: MouseEvent) => {
        const positionInPercent = (e.clientX / progresss.value.clientWidth) * 100;
        const duration = (store.state.player.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
        instance.put(`me/player/seek?position_ms=${Math.round(duration)}`);
      });
    });

    return {
      current,
      store,
      getDevices,
      setDevice,
      setVolume,
      goPlay,
      goNext,
      goPause,
      perc,
      time,
      timecode,
      progresss,
      refVolume,
      volume
    };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

@keyframes popSeek {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.volume {
  background-color: var(--bg-color-light);
  position: relative;
  height: 25px;
  width: 100px;
  display: inline-block;
  clip-path: polygon(0 74%, 100% 0, 100% 100%, 0% 100%);
  margin-bottom: 5px;

  &__cursor {
    background-color: var(--primary-color);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
  }

  &:hover {
    .volume__hover {
      display: block;
    }
  }

  &__hover {
    background-color: rgba(black, 0.2);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: none;
  }
}

.cover {
  border-radius: 4px;
  display: block;
}

.player {
  background: var(--bg-color);
}

.trackname {
  font-style: italic;
}

.artistname {
  font-weight: 700;
  text-decoration: none;
  color: currentColor;
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
      background-color: var(--bg-color-light);
    }
  }
}
.options {
  text-align: right;
}
.meta {
  $sidewidth: 300px;
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
  background: var(--bg-color-light);
  height: 10px;
  position: relative;
  cursor: pointer;
  flex: 1;

  .seek {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: rgba(black, 0.3);
    display: none;
    animation: popSeek 0.2s ease 0s both;

    .time {
      position: absolute;
      bottom: calc(100% + 5px);
      background: var(--primary-color);
      color: rgba(white, 0.8);
      padding: 5px 10px;
      right: 0;
      border: 1px solid var(--primary-color-light);
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
    // transition: width linear 1s;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
