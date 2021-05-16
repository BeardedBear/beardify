<template>
  <div v-if="!store.state.player.currentlyPlaying" class="player-loading">
    <div class="player-loading__title">Choisir un périphérique de lecture :</div>
    <span v-if="store.state.player.devices.list.length">
      <button
        v-for="(device, _, index) in store.state.player.devices.list"
        :key="index"
        type="button"
        class="device button button--x-small"
        :class="{ me: store.state.player.thisDeviceId === device.id }"
        @click="setDevice(device)"
      >
        {{ device.name }}
      </button>
    </span>
  </div>
  <div v-else class="player">
    <div>
      <div class="meta">
        <div class="controls">
          <div>
            <button v-if="!store.state.player.currentlyPlaying.is_playing" class="controls__btn" @click="goPlay()">
              <i class="icon-play" />
            </button>
            <button v-else class="controls__btn" @click="goPause()">
              <i class="icon-pause" />
            </button>
            <button class="controls__btn" @click="goNext()">
              <i class="icon-skip-forward" />
            </button>
          </div>
          <div v-if="store.state.player.currentlyPlaying.progress_ms">
            {{ timecode(store.state.player.currentlyPlaying.progress_ms) }} /
            {{ timecode(store.state.player.currentlyPlaying.item.duration_ms) }}
          </div>
          <div />
        </div>

        <div>
          <div class="meta__what">
            <router-link :to="`/album/${store.state.player.currentlyPlaying.item.album.id}`">
              <Cover size="small" :images="store.state.player.currentlyPlaying.item.album.images" class-name="cover" />
            </router-link>
            <div>
              <div>
                <ArtistList :artist-list="store.state.player.currentlyPlaying.item.album.artists" />
                ·
                <span class="trackname">{{ store.state.player.currentlyPlaying.item.name }}</span>
              </div>
              <div class="album">
                {{ store.state.player.currentlyPlaying.item.album.name }}
              </div>
            </div>
          </div>
        </div>

        <div class="options">
          <div><Volume /></div>
          <button
            v-for="(device, _, index) in store.state.player.devices.list"
            :key="index"
            type="button"
            class="device button button--x-small"
            :class="{
              'button--primary': device.id === store.state.player.devices.activeDevice.id,
              me: store.state.player.thisDeviceId === device.id,
            }"
            @click="setDevice(device)"
          >
            {{ device.name }}
          </button>
        </div>
      </div>
      <SeekBar />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { useStore } from "vuex";
import { instance } from "../../api";
import { PlayerActions } from "./../player/PlayerStore";
import { RootState } from "../../@types/RootState";
import ArtistList from "../ArtistList.vue";
import { Device } from "../../@types/Device";
import Cover from "../Cover.vue";
import { timecode } from "../../helpers/date";
import SeekBar from "./SeekBar.vue";
import Volume from "./Volume.vue";

export default defineComponent({
  components: { ArtistList, Cover, SeekBar, Volume },
  setup() {
    const store = useStore<RootState>();
    const perc = ref();
    const time = ref();

    function setDevice(device: Device) {
      store.dispatch(`player/${PlayerActions.setDevice}`, device);
    }

    function goPlay() {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.activeDevice,
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

    return {
      store,
      setDevice,
      goPlay,
      goNext,
      goPause,
      perc,
      time,
      timecode,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player-loading {
  display: grid;
  place-content: center;
  padding: 10px;
  background-color: var(--bg-color);
  padding: 20px;
  text-align: center;

  &__title {
    margin-bottom: 15px;
  }
}
.device {
  margin-left: 5px;
  &.me {
    position: relative;
    &::before {
      $s: 7px;
      position: absolute;
      top: 0;
      right: 0;
      background: white;
      border-top-right-radius: 3px;
      width: $s;
      height: $s;
      content: "";
      clip-path: polygon(0 0, 100% 0, 100% 100%);
    }
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

    img {
      height: 50px;
      margin-right: 15px;
    }
  }
}
</style>
