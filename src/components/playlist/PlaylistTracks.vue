<template>
  <template :key="track" v-for="(track, index) in trackList">
    <div
      :class="{
        active: isCurrentTrack(track.track, currentTrack),
        deletable: playlist.owner.id === me?.id || playlist.collaborative,
      }"
      @click="
        playSongs(
          index,
          trackList.map((e) => e.track),
        )
      "
      class="track"
    >
      <div class="track-icon">
        <i class="track-icon-item music icon-note" />
        <i
          @click.prevent.stop="open({ type: 'addSong', track: track.track })"
          class="track-icon-item save icon-plus"
        ></i>
      </div>
      <div>
        <div class="track-name">{{ track.track.name }}</div>
        <ArtistList :artist-list="track.track.artists" feat />
      </div>
      <div class="album">
        <div class="adder" v-if="isAlbum(track.track.album)">
          <i class="adder-icon icon-album" />
          <i
            @click.prevent.stop="open({ type: 'addalbum', albumId: track.track.album.id })"
            class="adder-button icon-plus"
          />
        </div>
        <i
          :class="{
            'icon-ep': isEP(track.track.album),
            'icon-single': isSingle(track.track.album),
            'icon-compilation': isCompilation(track.track.album),
          }"
          v-else
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
      <div class="date">{{ date(track.added_at) }}</div>
      <div class="duration">{{ timecode(track.track.duration_ms) }}</div>
      <div v-if="playlist.owner.id === me?.id || playlist.collaborative">
        <button @click.prevent.stop="deleteSong(track.track.uri)" class="button button--nude delete">
          <i class="icon-trash-2"></i>
        </button>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { NotificationType } from "../../@types/Notification";
import { PlaylistTrack } from "../../@types/Playlist";
import { PublicUser } from "../../@types/PublicUser";
import { instance } from "../../api";
import { date, timecode } from "../../helpers/date";
import { isCurrentTrack } from "../../helpers/helper";
import { notification } from "../../helpers/notifications";
import { playSongs } from "../../helpers/play";
import { isAlbum, isCompilation, isEP, isSingle } from "../../helpers/useCleanAlbums";
import { useAuth } from "../../views/auth/AuthStore";
import { usePlaylist } from "../../views/playlist/PlaylistStore";
import AlbumLink from "../album/AlbumLink.vue";
import ArtistList from "../artist/ArtistList.vue";
import { useDialog } from "../dialog/DialogStore";
import { usePlayer } from "../player/PlayerStore";

const props = defineProps<{
  trackList: PlaylistTrack[];
  contributorsData?: Record<string, PublicUser>;
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
        tracks: [{ uri: songId }],
        snapshot_id: playlist.snapshot_id,
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
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

.track-name {
  font-weight: bold;
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
  }

  &-icon {
    &-item {
      font-size: 1.5rem;
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
    font-size: 0.9rem;
    font-style: italic;
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
  }

  .date {
    text-align: right;
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
  font-size: 0.9rem;
  font-weight: bold;
  padding-right: 0.5rem;
  text-align: right;
}

.album {
  align-items: center;
  display: flex;
  font-size: 0.9rem;
  text-align: left;

  i {
    font-size: 1rem;
    margin-right: 0.8rem;
    opacity: 0.3;

    &.icon-album {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}
</style>
