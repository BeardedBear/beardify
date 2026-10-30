import { defineStore } from "pinia";

import { defaultPlaylist } from "@/@types/Defaults";
import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistEntry, PlaylistPage, PlaylistTrack } from "@/@types/Playlist";
import { TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { planDuplicateCleanup, planRangeMove } from "@/helpers/arrayDiff";
import { buildCollectionDescription, parseCollectionRankingMode, stripCollectionTags } from "@/helpers/collectionOptions";
import { isInLibrary, saveToLibrary } from "@/helpers/library";
import { notification } from "@/helpers/notifications";
import { addPlaylistItems, removePlaylistItems } from "@/helpers/playlist";
import router from "@/router";

// Reorder requests are index-based, so they must reach Spotify one at a time, in order.
let reorderQueue: Promise<void> = Promise.resolve();
let reorderEpoch = 0;

// Unavailable entries (`item: null`) get no key: they never group with or match an album.
const albumOf = (entry: PlaylistEntry): null | string => entry.item?.album.id ?? null;
const urisOf = (entries: PlaylistEntry[]): string[] => entries.flatMap((entry) => (entry.item ? [entry.item.uri] : []));

export const usePlaylist = defineStore("playlist", {
  actions: {
    async clean() {
      this.tracksVersion++;
      this.filter = "";
      this.playlist = defaultPlaylist;
      this.items = [];
    },

    /**
     * Collapses every album found at several places in the collection down to
     * its first run (see planDuplicateCleanup). Done once the whole collection
     * is loaded rather than on drag: every copy is visible then, the drag only
     * ever has one run to move, and deletion/undo resolve positions on a clean
     * list. Owner-only — call it after getTracks has finished.
     */
    cleanCollectionDuplicates(): Promise<void> {
      const plan = planDuplicateCleanup(this.items, albumOf);
      if (!plan) return reorderQueue;
      this.items = plan.next;

      const playlistId = this.playlist.id;
      const removed = [...new Set(urisOf(plan.removed))].map((uri) => ({ uri }));
      const albumCount = plan.inserts.length;
      return this.queueCollectionWrite("Unable to remove duplicate albums. Please reload.", async () => {
        this.setSnapshot(playlistId, await removePlaylistItems(playlistId, removed, this.playlist.snapshot_id));
        for (const { position, run } of plan.inserts) {
          this.setSnapshot(playlistId, await addPlaylistItems(playlistId, urisOf(run), position));
        }
        notification({
          msg: `Removed duplicate copies of ${albumCount} album${albumCount > 1 ? "s" : ""}`,
          type: NotificationType.Success,
        });
      });
    },

    async followPlaylist(playlistId: string) {
      try {
        await saveToLibrary("playlist", playlistId);
        this.followed = true;
        useSidebar().refreshPlaylists();
      } catch {
        // silent fail (could add notification later)
      }
    },

    async getPlaylist(url: string) {
      try {
        this.playlist = (await instance().get<Playlist>(url)).data;
        this.followed = await isInLibrary("playlist", this.playlist.id);
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error("Error fetching playlist:", error);
        this.playlist = defaultPlaylist;
        this.followed = false;
        notification({ msg: "Unable to load this playlist", type: NotificationType.Error });
      }
    },

    async getTracks(url: string, version?: number) {
      const v = version ?? this.tracksVersion;
      try {
        const e = await instance().get<Paging<PlaylistEntry>>(url);
        // If tracks were reset by a newer navigation, abandon this pagination chain
        if (this.tracksVersion !== v) return;
        // Unavailable entries are kept: they hold a position the write endpoints count
        this.items = this.items.concat(e.data.items);
        if (e.data.next) await this.getTracks(e.data.next, v);
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error("Error fetching playlist tracks:", error);
      }
    },

    async migrateLegacyCollectionTag() {
      const cleanName = stripCollectionTags(this.playlist.name);
      const rawDescription = stripCollectionTags(this.playlist.description);
      const cleanDescription = rawDescription === "No description" ? "" : rawDescription;
      const rankingMode = parseCollectionRankingMode(this.playlist.description);
      const newDescription = buildCollectionDescription(cleanDescription, true, rankingMode);

      try {
        await instance().put(`playlists/${this.playlist.id}`, { description: newDescription, name: cleanName });
        this.playlist.name = cleanName;
        this.playlist.description = newDescription;
        useSidebar().refreshPlaylists();
        notification({ msg: "Collection converted to the new format", type: NotificationType.Success });
        router.push(`/collection/${this.playlist.id}`);
      } catch {
        notification({ msg: "Unable to convert this collection. Please try again.", type: NotificationType.Error });
      }
    },

    /**
     * Collection writes are index-based, so they reach Spotify one at a time,
     * in the order they were planned against `this.items`. A failure reloads
     * the real order and drops the writes queued behind it, whose indices
     * assumed it had succeeded.
     */
    queueCollectionWrite(errorMsg: string, request: () => Promise<void>): Promise<void> {
      const playlistId = this.playlist.id;
      const epoch = reorderEpoch;
      reorderQueue = reorderQueue.then(async () => {
        if (epoch !== reorderEpoch) return;
        try {
          await request();
        } catch {
          reorderEpoch++;
          notification({ msg: errorMsg, type: NotificationType.Error });
          if (this.playlist.id === playlistId) await this.reloadTracks(`playlists/${playlistId}/items`);
        }
      });
      return reorderQueue;
    },

    /*
     * getTracks concatenates onto whatever is already loaded, so calling it
     * twice duplicates the list. Undo needs a real reload — reset first, and
     * bump the version so any pagination chain still in flight abandons instead
     * of appending its pages onto the fresh list.
     */
    async reloadTracks(url: string) {
      this.tracksVersion++;
      this.items = [];
      await this.getTracks(url, this.tracksVersion);
    },

    removeSong(songUri: string) {
      this.items = this.items.filter((entry) => entry.item?.uri !== songUri);
    },

    removeTracks(tracks: TrackToRemove[]) {
      // Use Set for O(1) lookup instead of array.includes() which is O(n)
      const urisToRemove = new Set(tracks.map((track) => track.uri));
      this.items = this.items.filter((entry) => !entry.item || !urisToRemove.has(entry.item.uri));
    },

    /** Keeps the snapshot current after a write, unless the user has since opened another playlist. */
    setSnapshot(playlistId: string, snapshotId: string | undefined) {
      if (snapshotId && this.playlist.id === playlistId) this.playlist.snapshot_id = snapshotId;
    },

    /**
     * Takes album ids, not positions. The drag UI reorders a deduplicated
     * `albumList` (see removeDuplicatesAlbums), which is shorter than
     * `this.items` whenever a collection has more than one track for the
     * same album — most likely in a large, loosely curated tail. A position
     * in that deduped list doesn't line up with the same position in the raw
     * track list, so sending it straight through as range_start/insert_before
     * silently reordered the wrong track. Resolving both ids against
     * `this.items` right before the call is immune to that drift. `this.items`
     * and not `this.tracks`: unavailable entries still hold a server position.
     *
     * `this.items` is reordered right away so it keeps mirroring the server
     * order the next drag resolves against, and the requests run one at a
     * time so Spotify applies them in the order they were planned. A failure
     * reloads the real order and drops the moves queued behind it, whose
     * indices assumed it had succeeded.
     *
     * Only the album's first run moves: stray copies further down are
     * removed when the collection loads (see cleanCollectionDuplicates).
     */
    updateCollectionPosition(movedAlbumId: string, beforeAlbumId: null | string): Promise<void> {
      const move = planRangeMove(this.items, albumOf, movedAlbumId, beforeAlbumId);
      if (!move) return reorderQueue;
      this.items = move.next;

      const playlistId = this.playlist.id;
      return this.queueCollectionWrite("Unable to reorder the playlist. Please try again.", async () => {
        const { data } = await instance().put<{ snapshot_id?: string }>(`playlists/${playlistId}/items`, {
          insert_before: move.insertBefore,
          range_length: move.rangeLength,
          range_start: move.rangeStart,
        });
        this.setSnapshot(playlistId, data.snapshot_id);
      });
    },
  },

  getters: {
    /** Playable entries only, for display. Positions sent to the API come from `items`. */
    tracks: (state): PlaylistTrack[] => state.items.filter((entry): entry is PlaylistTrack => entry.item !== null),
  },

  state: (): PlaylistPage => ({
    filter: "",
    followed: false,
    items: [],
    playlist: defaultPlaylist,
    tracksVersion: 0,
  }),
});
