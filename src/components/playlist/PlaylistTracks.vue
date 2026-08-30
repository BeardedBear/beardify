<template>
  <template v-for="(track, index) in trackList" :key="track.item.id">
    <div
      :class="{
        active: isCurrentTrack(track.item, currentTrack),
        deletable: canDelete,
      }"
      class="track"
      @click="
        playSongs(
          index,
          trackList.map((e) => e.item),
        )
      "
    >
      <div class="track-icon">
        <i class="track-icon-item music icon-note" />
        <i class="track-icon-item save icon-plus" @click.prevent.stop="open({ type: 'addSong', track: track.item })" />
      </div>
      <div>
        <div class="track-name bd-font-bold">
          {{ track.item.name }}
        </div>
        <ArtistList :artist-list="track.item.artists" feat />
      </div>
      <div class="album">
        <div v-if="isAlbum(track.item.album)" class="adder">
          <i class="adder-icon icon-album" />
          <i
            class="adder-button icon-plus"
            @click.prevent.stop="open({ type: 'addalbum', albumId: track.item.album.id })"
          />
        </div>
        <i
          v-else
          :class="{
            'icon-ep': isEP(track.item.album),
            'icon-single': isSingle(track.item.album),
            'icon-compilation': isCompilation(track.item.album),
          }"
        />
        <AlbumLink :album="track.item.album" no-icon />
      </div>
      <div class="contributor">
        <BdTooltip
          v-if="getContributorAvatar(track.added_by.id)"
          :content="getContributorDisplayName(track.added_by.id)"
          bare
        >
          <img :src="getContributorAvatar(track.added_by.id)" alt="" />
        </BdTooltip>
      </div>
      <div class="date">
        {{ date(track.added_at) }}
      </div>
      <div class="duration bd-font-bold">
        {{ timecode(track.item.duration_ms) }}
      </div>
      <div v-if="canDelete">
        <BdTooltip bare content="Remove this track">
          <BdButton
            aria-label="Remove this track"
            class="delete"
            icon-only
            variant="nude"
            @click.prevent.stop="deleteSong(track.item.uri)"
          >
            <i aria-hidden="true" class="icon-trash-2" />
          </BdButton>
        </BdTooltip>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { BdButton, BdTooltip } from "bearded-ui";
import { computed } from "vue";

import { NotificationType } from "@/@types/Notification";
import { PlaylistTrack } from "@/@types/Playlist";
import { PublicUser } from "@/@types/PublicUser";
import AlbumLink from "@/components/album/AlbumLink.vue";
import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import { date, timecode } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";
import { notification, notifyUndoable } from "@/helpers/notifications";
import { playSongs } from "@/helpers/play";
import { addPlaylistItems, isPlaylistOwner, removePlaylistItems } from "@/helpers/playlist";
import { isAlbum, isCompilation, isEP, isSingle } from "@/helpers/useCleanAlbums";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{
  contributorsData?: Record<string, PublicUser>;
  trackList: PlaylistTrack[];
}>();

const { open } = useDialog();
const playlistStore = usePlaylist();
const { playlist, removeSong } = playlistStore;
const canDelete = computed(() => isPlaylistOwner(playlist.owner) || playlist.collaborative);
const currentTrack = computed(() => usePlayer().playerState?.track_window.current_track);

const getContributorAvatar = (userId: string): string => {
  const images = props.contributorsData?.[userId]?.images ?? [];
  return images[1]?.url ?? images[0]?.url ?? "";
};

const getContributorDisplayName = (userId: string): string => {
  return props.contributorsData?.[userId]?.display_name || userId;
};

async function deleteSong(songId: string): Promise<void> {
  // Captured before the removal: restoring at the end of the playlist is not
  // an undo, it is a different playlist.
  const position = playlistStore.tracks.findIndex((entry) => entry.item.uri === songId);
  const name = playlistStore.tracks[position]?.item.name;
  try {
    await removePlaylistItems(playlist.id, [{ uri: songId }], playlist.snapshot_id);
    removeSong(songId);
    notifyUndoable(name ? `Removed ${name}` : "Track removed", async () => {
      await addPlaylistItems(playlist.id, [songId], position >= 0 ? position : undefined);
      await playlistStore.reloadTracks(`playlists/${playlist.id}/items`);
    });
  } catch (error: any) {
    notification({
      msg: error.response?.data?.error?.message ?? "Unable to delete this track",
      type: NotificationType.Error,
    });
  }
}
</script>

<style scoped>

.track-icon {
  .save {
    cursor: pointer;
    display: none;
  }

  &:hover {
    .music {
      display: none;
    }

    .save {
      display: block;
      opacity: 0.8;
    }
  }
}

.track-icon-item {
  font-size: var(--bd-font-size-xl);
  opacity: 0.1;
}

.adder-button {
  background: none;
  border: none;
  color: var(--bd-primary);
  cursor: pointer;
  display: none;
  opacity: 1;
}

.track {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: grid;
  gap: var(--bd-space-3);
  grid-template-columns: 2.2rem 1fr 0.9fr auto 0.3fr 2.8rem;
  margin-bottom: var(--bd-space-2);
  padding: var(--bd-space-2) var(--bd-space-3);

  &.deletable {
    grid-template-columns: 2.2rem 1fr 0.9fr auto 0.3fr 2.8rem auto;

    @media (--mobile) {
      grid-template-columns: 2.2rem 1fr auto auto;
    }
  }

  @media (--mobile) {
    gap: var(--bd-space-2);
    grid-template-columns: 2.2rem 1fr auto;
    padding: var(--bd-space-2);
  }

  .delete {
    opacity: 0.3;

    &:hover {
      opacity: 1;
    }
  }

  .link,
  .date,
  .owner {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-sm);
    font-style: var(--bd-style-italic-fallback);
    font-variation-settings: var(--bd-font-variation-settings-italic);
    text-decoration: none;
  }

  .contributor {
    --contributor-size: 1.5rem;

    img {
      border-radius: var(--bd-radius-full);
      display: block;
      height: var(--contributor-size);
      width: var(--contributor-size);
    }

    @media (--mobile) {
      display: none;
    }
  }

  .date {
    text-align: right;

    @media (--mobile) {
      display: none;
    }
  }

  .link {
    &:hover {
      color: var(--bd-primary);
      opacity: 1;
    }
  }

  &:hover {
    background-color: var(--bd-bg-dark);
  }

  &:active {
    background-color: var(--bd-bg);
  }

  .adder {
    &:hover {
      .adder-button {
        display: block;
      }

      .adder-icon {
        display: none;
      }
    }
  }
}

.duration {
  font-size: var(--bd-font-size-sm);
  font-variant-numeric: tabular-nums;
  padding-right: var(--bd-space-2);
  text-align: right;
}

.album {
  align-items: center;
  display: flex;
  font-size: var(--bd-font-size-sm);
  text-align: left;

  @media (--mobile) {
    display: none;
  }

  i {
    font-size: var(--bd-font-size-base);
    margin-right: var(--bd-space-3);
    opacity: 0.3;

    &.icon-album {
      color: var(--bd-primary);
      opacity: 1;
    }
  }
}
</style>
