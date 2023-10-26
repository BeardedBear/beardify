<template>
  <div class="frame" v-if="frameStore.show">
    <div :class="{ 'is-closing': frameStore.isClosing }" @click="frameStore.close()" class="bg"></div>
    <div class="iframe-wrap">
      <LoadingDots class="load" />
      <div class="head">
        <div>{{ frameStore.siteName }}</div>
        <div class="right">
          <a :href="frameStore.url" class="button button--small" target="_blank">Open in a new tab</a>
          <button @click="frameStore.close()" class="button button--small">Close</button>
        </div>
      </div>
      <iframe :class="{ 'is-closing': frameStore.isClosing }" :src="frameStore.url" border="0"></iframe>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LoadingDots from "../LoadingDots.vue";
import { useFrame } from "./FrameStore";

const frameStore = useFrame();
</script>

<style lang="scss" scoped>
@keyframes pop-bg {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes bye-bg {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.bg {
  animation: pop-bg 0.2s ease both;
  background-color: #0d0d0d;
  filter: opacity(0.95);
  inset: 0;
  position: fixed;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}

.head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;

  .right {
    display: flex;
    gap: 0.5rem;
  }
}

.frame {
  align-items: center;
  display: grid;
  height: 100%;
  justify-items: center;
  position: fixed;
  width: 100%;
  z-index: 999;

  .load {
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.iframe-wrap {
  background-color: var(--bg-color);
  border-radius: 15px;
  z-index: 1000;
}

iframe {
  animation: pop-bg 0.2s ease both;
  border: 0;
  border-radius: 10px;
  height: 80vh;
  width: 80vw;

  &.is-closing {
    animation: bye-bg 0.2s ease both;
  }
}
</style>
