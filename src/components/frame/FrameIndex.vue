<template>
  <div v-if="frameStore.show" class="frame">
    <div class="bg" :class="{ 'is-closing': frameStore.isClosing }" @click="frameStore.close()"></div>
    <div class="iframe-wrap">
      <LoadingDots class="load" />
      <iframe border="0" :src="frameStore.url" :class="{ 'is-closing': frameStore.isClosing }"></iframe>
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
