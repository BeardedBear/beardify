<template>
  <div class="sharing squircle">
    <div class="title squircle">
      <i class="share-icon icon-share" />
    </div>
    <span v-if="clipboardSpotify.copied.value" class="copied font-bold">Spotify URL copied</span>
    <span v-if="clipboardBeardify.copied.value" class="copied font-bold">Beardify URL copied</span>
    <div class="content">
      <BdButton
        aria-label="Copy the Spotify link"
        class="copy"
        icon-only
        size="small"
        title="Copy the Spotify link"
        variant="nude"
        @click="clipboardSpotify.copy()"
      >
        <i aria-hidden="true" class="icon-spotify" />
      </BdButton>
      <BdButton
v-if="beardifyUrl" label="Copy the Beardify link"
        class="copy"
        icon-only
        size="small"
        variant="nude"
        @click="clipboardBeardify.copy()"
      >
        <i aria-hidden="true" class="icon-beardify" />
      </BdButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { BdButton } from "bearded-ui";

const props = defineProps<{
  beardifyUrl?: string;
  spotifyUrl: string;
}>();
const clipboardSpotify = useClipboard({ source: props.spotifyUrl });
const clipboardBeardify = useClipboard({
  source: window.location.origin + props.beardifyUrl,
});
</script>

<style scoped>

.sharing {
  --sharing-radius: 1rem;

  background-color: var(--bg-color);
  border: 0.05rem solid var(--bg-color-light);
  border-radius: var(--sharing-radius);
  display: flex;
  height: 2.25rem;
  position: relative;
}

.title {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: var(--sharing-radius) 0 0 var(--sharing-radius);
  display: flex;
}

.share-icon {
  font-size: var(--font-size-sm);
  opacity: 0.2;
  padding: 0.3rem 0.7rem 0.3rem 0.5rem;
}

.copy {
  font-size: var(--font-size-lg);
}

.content {
  align-items: center;
  display: flex;
  padding: 0 0.3rem 0 0.2rem;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translate(-50%, -70%);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.copied {
  animation: pop 0.2s ease both;
  color: var(--font-color-dark);
  font-size: var(--font-size-sm);
  left: 50%;
  margin-right: 0.8rem;
  position: absolute;
  top: calc(100% + 1rem);
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
</style>
