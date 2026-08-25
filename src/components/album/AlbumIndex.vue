<template>
  <div
    ref="albumRef"
    :class="{
      'exact-search': exactSearch,
      'actions-open': actionsOpen,
      dragging,
      'hover-metas': hoverMetas,
      'metas-above': metasAbove,
    }"
    class="album"
    tabindex="-1"
    @keydown.enter.prevent="handleCoverClick"
    @keydown.space.prevent="handleCoverClick"
  >
    <div v-if="isPlaying" class="current">
      <i class="icon-volume-2" />
    </div>
    <div class="visual">
      <div :class="{ 'is-playing': isPlaying }" class="cover">
        <Cover :images="album.images" :size="coverSize ? coverSize : 'medium'" class="img" @click="handleCoverClick" />
        <!--
          On the artwork, not in the text row. As a flex sibling with
          `flex-shrink: 0`, a two-digit rank ate a third of a 7rem tier cell
          and left the album name breaking mid-word on two clamped lines.
        -->
        <div v-if="rank" class="rank-number font-bold">{{ rank }}</div>
        <IconButton
          class="play squircle"
          icon="play"
          :label="`Play ${album.name}`"
          @click.stop="handlePlayAlbum(album.uri)"
        />
        <IconButton
          v-if="canSave"
          class="button-action add squircle"
          icon="plus"
          :label="`Add ${album.name} to a collection`"
          @click.stop="dialogStore.open({ type: 'addalbum', albumId: album.id })"
        />
        <IconButton
          v-if="canDelete"
          class="button-action delete squircle"
          icon="trash-2"
          :label="`Remove ${album.name} from this collection`"
          @click.stop="deleteAlbum(album.id)"
        />
        <div
          v-if="variantCount && variantCount > 0"
          class="album-group-stack-indicator"
          @click.stop="variantClick && variantClick()"
        >
          <div class="album-group-stack-layer album-group-stack-layer-1 font-bold" />
          <div class="album-group-stack-layer album-group-stack-layer-2 font-bold">
            {{ variantCount }}
          </div>
        </div>
      </div>
      <div v-if="!withoutMetas" class="metas">
        <div class="infos">
          <div class="name font-bold">
            {{ album.name }}
          </div>
          <div v-if="withArtists" class="artists">
            <ArtistList :artist-list="album.artists" feat />
          </div>
          <div v-if="album.release_date && !withoutReleaseDate" class="date font-italic">
            {{ album.release_date.split("-").shift() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { Album, AlbumSimplified } from "@/@types/Album";
import { ImageSize } from "@/@types/Image";
import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { TrackSimplified, TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import Cover from "@/components/ui/AlbumCover.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { isTouchDevice } from "@/helpers/isTouchDevice";
import { notification, notifyUndoable } from "@/helpers/notifications";
import { playAlbum } from "@/helpers/playAlbum"; // Import the playAlbum helper
import { addPlaylistItems, removePlaylistItems } from "@/helpers/playlist";
import router from "@/router";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{
  album: Album | AlbumSimplified;
  canDelete?: boolean;
  canSave?: boolean;
  coverSize?: ImageSize | undefined;
  dragging?: boolean;
  exactSearch?: boolean;
  hoverMetas?: boolean;
  metasAbove?: boolean;
  rank?: number;
  variantClick?: (() => void) | undefined;
  variantCount?: number;
  withArtists?: boolean;
  withoutMetas?: boolean;
  withoutReleaseDate?: boolean;
}>();

const currentRouteId = useRoute().params.id;
const dialogStore = useDialog();
const playlistStore = usePlaylist();
const playerStore = usePlayer();
const isPlaying = computed<boolean>(
  () => props.album.uri === playerStore.playerState?.track_window.current_track.album.uri,
);
const actionsOpen = ref(false);
const albumRef = ref<HTMLElement | null>(null);

function handleCoverClick(): void {
  if (isTouchDevice()) {
    if (actionsOpen.value) {
      handleAlbumClick();
      return;
    }

    actionsOpen.value = !actionsOpen.value;
  } else {
    handleAlbumClick();
  }
}

function onDocumentClick(e: MouseEvent): void {
  if (!actionsOpen.value || !albumRef.value) return;
  const target = e.target as Node;
  if (!albumRef.value.contains(target)) {
    actionsOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

async function deleteAlbum(albumId: string): Promise<void> {
  try {
    const e = await instance().get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`);
    if (!e.data.items || e.data.items.length === 0) {
      notification({ msg: "No tracks found in this album", type: NotificationType.Warning });
      return;
    }
    const tracks: TrackToRemove[] = [];
    e.data.items.forEach((track: TrackSimplified) => {
      if (track.uri) tracks.push({ uri: track.uri });
    });
    if (tracks.length === 0) {
      notification({ msg: "No valid track URIs found", type: NotificationType.Error });
      return;
    }

    /*
     * Read what to put back, and where, before removing anything.
     *
     * The removal above targets every track of the album by URI, but a
     * collection only ever holds one of them as a marker (see AddAlbum). So the
     * undo has to restore the intersection with what was actually in the
     * playlist — re-adding `tracks` wholesale would turn one album entry into a
     * full tracklist. And restoring at the end is not an undo: in a tier list it
     * would silently move the album to a different tier.
     */
    const present = new Map(playlistStore.tracks.map((entry, index) => [entry.item.uri, index]));
    const uris = tracks.map((track) => track.uri).filter((uri) => present.has(uri));
    const position = uris.length ? (present.get(uris[0]) ?? -1) : -1;

    try {
      await removePlaylistItems(`${currentRouteId}`, tracks, playlistStore.playlist.snapshot_id);
      playlistStore.removeTracks(tracks);
      if (uris.length) {
        notifyUndoable(`Removed ${props.album.name}`, async () => {
          await addPlaylistItems(`${currentRouteId}`, uris, position >= 0 ? position : undefined);
          await playlistStore.reloadTracks(`playlists/${currentRouteId}/items`);
        });
      }
    } catch (error: any) {
      notification({
        msg: error.response?.data?.error?.message ?? "Album delete failed",
        type: NotificationType.Error,
      });
    }
  } catch (error: any) {
    notification({
      msg: error.response?.data?.error?.message ?? "Album delete failed",
      type: NotificationType.Error,
    });
  }
}

/**
 * Handle album click to navigate and close dialog if open
 */
function handleAlbumClick(): void {
  if (dialogStore.show) {
    dialogStore.close();
  }
  router.push(`/album/${props.album.id}`);
}

/**
 * Wrapper function to call the imported playAlbum helper function
 * This fixes the issue where albums were being added to the playlist twice
 */
async function handlePlayAlbum(albumUri: string): Promise<void> {
  await playAlbum(albumUri);
}
</script>

<style scoped>

.play {
  --play-offset: 1rem;
  --play-size: 2.5rem;

  animation: pop-play-button 0.2s ease both;
  background: var(--primary-color);
  border: 0;
  border-radius: var(--play-size);
  bottom: var(--play-offset);
  color: rgb(255 255 255 / 80%);
  cursor: pointer;
  display: none;
  font-size: var(--font-size-lg);
  height: var(--play-size);
  left: var(--play-offset);
  line-height: 0;
  position: absolute;
  transition: transform ease 0.1s;
  width: var(--play-size);
  will-change: transform;

  &:hover {
    background: var(--primary-color-light);
    color: white;
  }

  &:active {
    background: var(--primary-color-lighter);
  }
}

.album {
  /* `animation: popAlbum 1s ease both` lived here, naming a keyframe that does
     not exist anywhere in the project — a no-op the browser silently ignored. */
  color: var(--font-color);
  font-family: inherit;
  line-height: 1.4;
  position: relative;
}

/*
 * Bottom-left of the artwork — which is also where the play button lands on
 * hover. All four corners are taken once the actions show, so the rank yields:
 * it is a scanning aid, and you are no longer scanning the moment you reach for
 * a control on that card.
 */
.rank-number {
  backdrop-filter: blur(2px);
  background: color-mix(in oklab, var(--bg-color-darker) 82%, transparent);
  border-radius: 0.3rem;
  bottom: 0.3rem;
  color: var(--font-color-light);
  font-size: var(--font-size-lg);
  left: 0.3rem;
  line-height: 1;
  padding: 0.15rem 0.4rem;
  position: absolute;
  transition: opacity 0.15s ease;
  z-index: 2;
}

.album.actions-open {
  .play,
  .add,
  .delete {
    display: block;
  }

  .img {
    opacity: 0.4;
  }

  .rank-number {
    opacity: 0;
  }
}

/* Hover-based interactions for devices that support it */
@media (hover: hover) {
  .album:hover {
    .play,
    .add,
    .delete {
      display: block;
    }

    .img {
      opacity: 0.4;
    }

    .rank-number {
      opacity: 0;
    }
  }
}

@keyframes pop-play-button {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(50deg);
  }

  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes pop-add-button {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/*
 * Was `bounce ... infinite alternate` on a cubic-bezier(1, 0, 1, 0) curve — a
 * marker that never stopped moving and had no reduced-motion escape. It now
 * announces itself once, on arrival, and then holds still: the badge already
 * says "this is the album playing" by existing.
 */
@keyframes pop-current {
  from {
    opacity: 0;
    transform: scale(0.6);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.button-action {
  animation: pop-add-button 0.2s ease both;
  background-color: transparent;
  border: 0;
  border-radius: 20rem;
  color: currentcolor;
  cursor: pointer;
  display: none;
  font-size: var(--font-size-lg);
  padding: 0.4rem 0.5rem;
  position: absolute;
  transition: transform ease 0.1s;
  will-change: transform;

  &:hover {
    background-color: rgb(0 0 0 / 50%);
    color: currentcolor;
  }

  &.delete {
    left: 1rem;
    top: 1rem;
  }

  &.add {
    bottom: 1rem;
    right: 1rem;
  }
}

.metas {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.cover {
  border-radius: 0.4rem;
  margin-bottom: 0.8rem;
  position: relative;
  transition: box-shadow ease 0.2s;

  &.is-playing {
    box-shadow:
      0 0 0 0.3rem var(--bg-color),
      0 0 0 0.5rem var(--primary-color);
  }
}

/*
 * Collapses .metas to zero height by default and pins the card's own box to a
 * fixed square: aspect-ratio + align-self: start prevents grid/flex stretch
 * from growing the whole row to match .visual's revealed height once it pops
 * out.
 */
.album.hover-metas {
  align-self: start;
  aspect-ratio: 1 / 1;

  .visual {
    display: flex;
    flex-direction: column;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;

    /* impeccable-disable-next-line layout-transition -- absolute box: reflows one card's subtree, once per hover */
    transition: padding 0.15s ease;
  }

  .cover {
    margin-bottom: 0;
  }

  .metas {
    margin-top: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition:
      margin-top ease 0.2s,
      max-height ease 0.2s,
      opacity ease 0.15s;
  }

}

/*
 * Overlays the info on top of the cover (top edge) instead of growing the card
 * past its own box. Used where downward growth would get clipped by an
 * ancestor's overflow (e.g. a horizontally scrolling row — overflow-x: auto
 * forces overflow-y: auto too, so anything popping outside gets clipped
 * regardless of direction; staying within the card's own square avoids it).
 */
.album.hover-metas.metas-above {
  .metas {
    background: linear-gradient(rgb(0 0 0 / 85%) 40%, rgb(0 0 0 / 0%));
    border-radius: 0.6rem 0.6rem 0 0;
    color: #fff;
    left: 0;
    margin: 0;
    padding: 0.6rem;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    transition: opacity ease 0.15s;
    z-index: 3;
  }
}

/*
 * The revealed state. .dragging suppresses it (any card the pointer passes over
 * while dragging another one would otherwise pop its info open mid-drag).
 * These blocks are ordered by ascending specificity, which is also the order
 * they must win in.
 */
.album.hover-metas.actions-open:not(.dragging) {
  .visual {
    background-color: var(--bg-color-light);
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 40%);
    padding: 0.5rem;
    z-index: 5;
  }

  .metas {
    margin-top: 0.6rem;
    max-height: 10rem;
    opacity: 1;
  }
}

.album.hover-metas.metas-above.actions-open:not(.dragging) {
  .metas {
    margin: 0;
    max-height: none;
    opacity: 1;
  }

  .visual {
    padding: 0;
  }
}

@media (hover: hover) {
  .album.hover-metas:hover:not(.dragging) {
    .visual {
      background-color: var(--bg-color-light);
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 40%);
      padding: 0.5rem;
      z-index: 5;
    }

    .metas {
      margin-top: 0.6rem;
      max-height: 10rem;
      opacity: 1;
    }
  }

  .album.hover-metas.metas-above:hover:not(.dragging) {
    .metas {
      margin: 0;
      max-height: none;
      opacity: 1;
    }

    .visual {
      padding: 0;
    }
  }
}

.infos {
  flex: 1;
  min-width: 0;
}

.current {
  --current-size: 3rem;

  background: var(--primary-color);
  border-radius: 0 0.4rem 0 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  height: var(--current-size);
  position: absolute;
  right: 0;
  top: 0;
  transition: background-color 0.2s ease;
  width: var(--current-size);
  z-index: 1;

  i {
    animation: pop-current 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    color: #fff;
    font-size: var(--font-size-lg);
    position: absolute;
    right: 0.3rem;
    top: 0.3rem;
  }
}

.name {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  line-break: auto;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  margin: 0.3rem 0 0;
  overflow: hidden;

  /*
   * `anywhere` split words mid-character — "Peripher / y" — because it lets a
   * break land between any two letters. `break-word` only breaks a word that
   * cannot fit on a line of its own, so names wrap at spaces and ellipsise
   * instead of shattering.
   */
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}

/*
 * One line, ellipsised. Unclamped, "Genus Ordinis Dei" or "The Pretty Reckless"
 * stacked three deep in a narrow cell and every card in the row grew to match.
 */
.artists {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  color: var(--font-color-dark);
  font-size: var(--font-size-sm);
}

.album-group-stack-layer {
  background: var(--bg-color-light);
  border: 0.1rem solid var(--bg-color-lighter);
  border-radius: 0.3rem;
  box-shadow: 0 0.2rem 0.4rem rgb(0 0 0 / 30%);
  font-size: var(--font-size-sm);
  height: 1.5rem;
  position: absolute;
  transition:
    left 0.15s ease,
    top 0.15s ease;
  width: 1.5rem;
}

.album-group-stack-layer-1 {
  left: calc(var(--indicator-offset) - 0.3rem);
  top: calc(var(--indicator-offset) - 0.3rem);
}

.album-group-stack-layer-2 {
  align-items: center;
  display: flex;
  justify-content: center;
  left: calc(var(--indicator-offset) - 0.3rem);
  top: calc(var(--indicator-offset) - 0.3rem);
}

/* Album group stack indicator styles (part of Album component to avoid !important) */
.album-group-stack-indicator {
  /* The layers below live inside this element, so they inherit the offset. */
  --indicator-offset: 0.5rem;
  --indicator-size: 1.5rem;

  cursor: pointer;
  height: var(--indicator-size);
  left: var(--indicator-offset);
  opacity: 0;
  position: absolute;
  top: var(--indicator-offset);
  transform: translateY(-0.15rem) scale(0.97);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  visibility: hidden;
  width: var(--indicator-size);
  z-index: 10;

  &:hover .album-group-stack-layer-1 {
    left: calc(var(--indicator-offset) - -0.05rem);
    top: calc(var(--indicator-offset) - -0.05rem);
  }
}

/* show indicator on hover-capable devices and when actions are toggled on touch */
@media (hover: hover) {
  .album:hover .album-group-stack-indicator {
    opacity: 1;
    transform: translateY(0) scale(1);
    visibility: visible;
  }
}

.album.actions-open .album-group-stack-indicator {
  opacity: 1;
  transform: translateY(0) scale(1);
  visibility: visible;
}
</style>
