<template>
  <div class="player">
    <div>
      <div class="meta">
        <div class="controls">
          <div>
            <button class="controls__btn" v-if="current.track.paused" @click="goPlay()">
              <i class="icon-play"></i>
            </button>
            <button class="controls__btn" v-else @click="goPause()"><i class="icon-pause"></i></button>
            <button class="controls__btn" @click="goNext()"><i class="icon-skip-forward"></i></button>
          </div>
          <div>{{ timecode(current.track.position) }} / {{ timecode(current.track.duration) }}</div>
          <div></div>
        </div>

        <div class="meta__what">
          <img :src="current.track.trackWindow.current_track.album.images[1].url" alt="" />
          <div>
            <div>
              <span v-for="(artist, _, index) in current.track.trackWindow.current_track.artists" :key="index">
                <span class="artistname">{{ artist.name }}</span>
                <span v-if="current.track.trackWindow.current_track.artists.length === index">,</span>
              </span>
              · <span class="trackname">{{ current.track.trackWindow.current_track.name }}</span>
            </div>
            <div class="album">{{ current.track.trackWindow.current_track.album.name }}</div>
          </div>
        </div>
        <div class="options">coucou</div>
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
import { defineComponent, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { instance } from "@/api";
import { Mutations } from "@/components/PlayerStore";
import { timecode } from "@/helpers/date";
import { RootState } from "@/@types/rootStore";

/* eslint-disable @typescript-eslint/camelcase */
export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const current = useStore<RootState>().state.player.currentlyPlaying;
    const progresss = ref();
    const perc = ref();
    const time = ref();

    function goPlay() {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.thisDevice
      });
    }

    function goNext() {
      instance.post("me/player/next");
    }

    function goPause() {
      instance.put("me/player/pause", {
        device_id: store.state.player.devices.thisDevice
      });
    }

    addEventListener("playerStateChanged", ((detail: CustomEvent) => {
      store.commit(`player/${Mutations.PLAYER_STATE_CHANGED}`, {
        duration: detail.detail.duration,
        position: detail.detail.position,
        paused: detail.detail.paused,
        repeatMode: detail.detail.repeat_mode,
        shuffle: detail.detail.shuffle,
        trackWindow: detail.detail.trackWindow
      });
    }) as EventListener);

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
        instance.put(
          `me/player/seek?position_ms=${Math.round(duration)}&device_id=${store.state.player.devices.thisDevice}`
        );
      });
    });

    return { store, current, goPlay, goPause, goNext, progresss, perc, time, timecode };
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
      background-color: rgba(black, 0.3);
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
    transition: width linear 0.5s;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
