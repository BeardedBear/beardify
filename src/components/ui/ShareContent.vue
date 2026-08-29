<template>
  <div class="sharing bd-squircle">
    <div class="title bd-squircle">
      <i class="share-icon icon-share" />
    </div>
    <span v-if="clipboardSpotify.copied.value" class="copied bd-font-bold">Spotify URL copied</span>
    <span v-if="clipboardBeardify.copied.value" class="copied bd-font-bold">Beardify URL copied</span>
    <div class="content">
      <BdTooltip bare content="Copy the Spotify link">
        <BdButton
          aria-label="Copy the Spotify link"
          class="copy"
          icon-only
          size="small"
          variant="nude"
          @click="clipboardSpotify.copy()"
        >
          <i aria-hidden="true" class="icon-spotify" />
        </BdButton>
      </BdTooltip>
      <BdTooltip v-if="beardifyUrl" bare content="Copy the Beardify link">
        <BdButton
          class="copy"
          icon-only
          label="Copy the Beardify link"
          size="small"
          variant="nude"
          @click="clipboardBeardify.copy()"
        >
          <i aria-hidden="true" class="icon-beardify" />
        </BdButton>
      </BdTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { BdButton, BdTooltip } from "bearded-ui";

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

  background-color: var(--bd-bg);
  border: 0.05rem solid var(--bd-bg-light);
  border-radius: var(--sharing-radius);
  display: flex;
  height: 2.25rem;
  position: relative;
}

.title {
  align-items: center;
  background-color: var(--bd-bg-light);
  border-radius: var(--sharing-radius) 0 0 var(--sharing-radius);
  display: flex;
}

.share-icon {
  font-size: var(--bd-font-size-sm);
  opacity: 0.2;
  padding: var(--bd-space-1) var(--bd-space-3) var(--bd-space-1) var(--bd-space-2);
}

.copy {
  font-size: var(--bd-font-size-lg);
}

.content {
  align-items: center;
  display: flex;
  padding: 0 var(--bd-space-1);
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
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  left: 50%;
  margin-right: var(--bd-space-3);
  position: absolute;
  top: calc(100% + 1rem);
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
</style>
