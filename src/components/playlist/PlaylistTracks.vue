<template>
  <template v-for="(track, index) in trackList" :key="track.track.id">
    <div
      :class="{
        active: isCurrentTrack(track.track, currentTrack),
        deletable: playlist.owner.id === me?.id || playlist.collaborative,
      }"
      class="track"
      @click="
        playSongs(
          index,
          trackList.map((e) => e.track),
        )
      "
    >
      <div class="track-icon">
        <i class="track-icon-item music icon-note" />
        <i class="track-icon-item save icon-plus" @click.prevent.stop="open({ type: 'addSong', track: track.track })" />
      </div>
      <div>
        <div class="track-name">
          {{ track.track.name }}
        </div>
        <ArtistList :artist-list="track.track.artists" feat />
      </div>
      <div class="album">
        <div v-if="isAlbum(track.track.album)" class="adder">
          <i class="adder-icon icon-album" />
          <i
            class="adder-button icon-plus"
            @click.prevent.stop="open({ type: 'addalbum', albumId: track.track.album.id })"
          />
        </div>
        <i
          v-else
          :class="{
            'icon-ep': isEP(track.track.album),
            'icon-single': isSingle(track.track.album),
            'icon-compilation': isCompilation(track.track.album),
          }"
        />
        <AlbumLink :album="track.track.album" no-icon />
      </div>
      <div class="contributor">
        <img
          :title="getContributorDisplayName(track.added_by.id)"
          :src="getContributorAvatar(track.added_by.id)"
          alt=""
        />
      </div>
      <div class="date">
        {{ date(track.added_at) }}
      </div>
      <div class="duration">
        {{ timecode(track.track.duration_ms) }}
      </div>
      <div v-if="playlist.owner.id === me?.id || playlist.collaborative">
        <ButtonIndex icon-only variant="nude" class="delete" @click.prevent.stop="deleteSong(track.track.uri)">
          <i class="icon-trash-2" />
        </ButtonIndex>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { NotificationType } from "@/@types/Notification";
import { PlaylistTrack } from "@/@types/Playlist";
import { PublicUser } from "@/@types/PublicUser";
import { instance } from "@/api";
import AlbumLink from "@/components/album/AlbumLink.vue";
import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { date, timecode } from "@/helpers/date";
import { isCurrentTrack } from "@/helpers/helper";
import { notification } from "@/helpers/notifications";
import { playSongs } from "@/helpers/play";
import { isAlbum, isCompilation, isEP, isSingle } from "@/helpers/useCleanAlbums";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{
  contributorsData?: Record<string, PublicUser>;
  trackList: PlaylistTrack[];
}>();

const { open } = useDialog();
const { playlist, removeSong } = usePlaylist();
const { me } = useAuth();
const currentTrack = computed(() => usePlayer().playerState?.track_window.current_track);

const getContributorAvatar = (userId: string): string => {
  return props.contributorsData?.[userId]?.images[1]?.url || userId;
};

const getContributorDisplayName = (userId: string): string => {
  return props.contributorsData?.[userId]?.display_name || userId;
};

async function deleteSong(songId: string): Promise<void> {
  try {
    await instance().delete(`playlists/${playlist.id}/tracks`, {
      data: {
        snapshot_id: playlist.snapshot_id,
        tracks: [{ uri: songId }],
      },
    });
    removeSong(songId);
    notification({ msg: "Track deleted", type: NotificationType.Success });
  } catch (error: any) {
    notification({
      msg: error.response?.data?.error?.message ?? "Failed to delete track",
      type: NotificationType.Error,
    });
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.track-name {
  @include font-bold;
}

.track {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: 2.2rem 1fr 0.9fr auto 0.3fr 2.8rem;
  margin-bottom: 0.4rem;
  padding: 0.4rem 0.8rem;

  &.deletable {
    grid-template-columns: 2.2rem 1fr 0.9fr auto 0.3fr 2.8rem auto;

    @include responsive.mobile {
      grid-template-columns: 2.2rem 1fr auto auto;
    }
  }

  @include responsive.mobile {
    gap: 0.5rem;
    grid-template-columns: 2.2rem 1fr auto;
    padding: 0.5rem;
  }

  &-icon {
    &-item {
      font-size: var(--font-size-xl);
      opacity: 0.1;
    }

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

  .delete {
    opacity: 0.3;

    &:hover {
      opacity: 1;
    }
  }

  .link,
  .date,
  .owner {
    color: currentcolor;
    font-size: var(--font-size-sm);

    @include font-italic;

    opacity: 0.5;
    text-decoration: none;
  }

  .contributor {
    $size: 1.5rem;

    img {
      border-radius: 50%;
      display: block;
      height: $size;
      width: $size;
    }

    @include responsive.mobile {
      display: none;
    }
  }

  .date {
    text-align: right;

    @include responsive.mobile {
      display: none;
    }
  }

  .link {
    &:hover {
      color: var(--primary-color);
      opacity: 1;
    }
  }

  &:hover {
    background-color: var(--bg-color-dark);
  }

  &:active {
    background-color: var(--bg-color);
  }

  .adder {
    &-button {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      display: none;
      opacity: 1;
    }

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
  font-size: var(--font-size-sm);
  font-variant: tabular-nums;

  @include font-bold;

  padding-right: 0.5rem;
  text-align: right;
}

.album {
  align-items: center;
  display: flex;
  font-size: var(--font-size-sm);
  text-align: left;

  @include responsive.mobile {
    display: none;
  }

  i {
    font-size: var(--font-size-base);
    margin-right: 0.8rem;
    opacity: 0.3;

    &.icon-album {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}
</style>
