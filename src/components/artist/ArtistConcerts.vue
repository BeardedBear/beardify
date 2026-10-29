<template>
  <div class="artist-concerts">
    <div class="concerts-toolbar">
      <BdSelect v-model="configStore.concertCountry" class="concerts-country" :options="countryOptions" />
      <BdButton :disabled="locating" @click="locate">
        <MapPin />
        {{ configStore.homeLocation ? "Update my location" : "Use my location" }}
      </BdButton>
    </div>
    <p v-if="configStore.homeLocation && !loading" class="concerts-nearby" :class="{ found: nearbyCount }">
      <MapPin class="concerts-nearby-icon" />
      {{
        nearbyCount
          ? `${nearbyCount} upcoming concert${nearbyCount > 1 ? "s" : ""} within ${NEAR_RADIUS_KM} km of you`
          : `No upcoming concert within ${NEAR_RADIUS_KM} km of you`
      }}
    </p>
    <div v-if="loading && !setlists.length" class="concerts-loader">
      <BdLoader size="small" />
    </div>
    <p v-else-if="!setlists.length" class="no-concerts">
      No concerts found{{ configStore.concertCountry ? ` in ${getCountryName(configStore.concertCountry)}` : "" }}
      on setlist.fm.
    </p>
    <template v-else>
      <div class="concerts-list">
        <details
          v-for="setlist in setlists"
          :key="setlist.id"
          class="concert-item"
          :class="{ upcoming: isUpcoming(setlist.eventDate) }"
        >
          <summary class="concert-summary">
            <div class="concert-date bd-font-bold">{{ formatDate(setlistDate(setlist.eventDate)) }}</div>
            <div class="concert-info">
              <div class="concert-venue bd-font-bold">{{ setlist.venue.name }}</div>
              <div class="concert-location">{{ location(setlist) }}</div>
            </div>
            <div v-if="setlist.tour" class="concert-tour">{{ setlist.tour.name }}</div>
            <template v-if="isUpcoming(setlist.eventDate)">
              <BdBadge v-if="isNear(setlist)" variant="success">Near you · {{ distance(setlist) }} km</BdBadge>
              <BdBadge variant="primary">Upcoming</BdBadge>
            </template>
            <div v-else class="concert-count">{{ songs(setlist).length || "No" }} songs</div>
          </summary>
          <ol v-if="songs(setlist).length" class="concert-songs">
            <li v-for="(song, index) in songs(setlist)" :key="index">{{ song }}</li>
          </ol>
          <a class="concert-link" :href="setlist.url" target="_blank" rel="noopener noreferrer">
            View on setlist.fm <ExternalLink class="concert-link-icon" />
          </a>
        </details>
      </div>
      <BdButton v-if="setlists.length < total" class="concerts-more" :disabled="loading" @click="loadPage(page + 1)">
        Load more
      </BdButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ExternalLink, MapPin } from "@lucide/vue";
import { BdBadge, BdButton, BdLoader, BdSelect } from "bearded-ui";
import { computed, ref, watch } from "vue";

import { NotificationType } from "@/@types/Notification";
import { Setlist } from "@/@types/Setlistfm";
import { useConfig } from "@/components/config/ConfigStore";
import { countries, getCountryName } from "@/helpers/country";
import { formatDate } from "@/helpers/date";
import { notification } from "@/helpers/notifications";
import { distanceKm, getSetlists, isUpcoming, setlistDate } from "@/helpers/setlistfm";
import { useArtist } from "@/views/artist/ArtistStore";

// ponytail: fixed radius, make it a setting if people ask for "near" to mean something else
const NEAR_RADIUS_KM = 150;

const artistStore = useArtist();
const configStore = useConfig();
const setlists = ref<Setlist[]>([]);
const loading = ref(true);
const locating = ref(false);
const page = ref(0);
const total = ref(0);
let request = 0;

const countryOptions = [
  { label: "All countries", value: "" },
  ...countries().map((country) => ({ label: country.name, value: country.code })),
];

// ponytail: counts loaded pages only — upcoming shows sit on page 1, newest first
const nearbyCount = computed(
  () => setlists.value.filter((setlist) => isUpcoming(setlist.eventDate) && isNear(setlist)).length,
);

/** Distance from home to the venue in km, or null when either point is unknown. */
function distance(setlist: Setlist): null | number {
  const coords = setlist.venue.city?.coords;
  const home = configStore.homeLocation;
  if (!coords || !home) return null;
  return Math.round(distanceKm(home, { lat: coords.lat, lon: coords.long }));
}

function isNear(setlist: Setlist): boolean {
  const km = distance(setlist);
  return km !== null && km <= NEAR_RADIUS_KM;
}

async function loadPage(next: number): Promise<void> {
  const mbid = artistStore.musicbrainzArtist?.id;
  if (!mbid) return;
  const id = ++request;
  loading.value = true;
  const data = await getSetlists(mbid, next, configStore.concertCountry);
  // Artist or country changed while the request was in flight
  if (id !== request) return;
  if (data) {
    setlists.value.push(...(data.setlist ?? []));
    page.value = data.page;
    total.value = data.total;
  }
  loading.value = false;
}

function locate(): void {
  if (!navigator.geolocation) {
    notification({ msg: "Geolocation is not available in this browser", type: NotificationType.Error });
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      // Rounded to ~1 km: precise enough for a radius, no need to persist an exact address
      configStore.homeLocation = { lat: +coords.latitude.toFixed(2), lon: +coords.longitude.toFixed(2) };
      locating.value = false;
    },
    () => {
      notification({ msg: "Couldn't get your location", type: NotificationType.Error });
      locating.value = false;
    },
    { maximumAge: 3_600_000 },
  );
}

function location(setlist: Setlist): string {
  const city = setlist.venue.city;
  return [city?.name, city?.state, city?.country?.name].filter(Boolean).join(", ");
}

function songs(setlist: Setlist): string[] {
  return setlist.sets.set.flatMap((set) => set.song.filter((song) => song.name).map((song) => song.name));
}

watch(
  [() => artistStore.musicbrainzArtist?.id, () => configStore.concertCountry],
  () => {
    setlists.value = [];
    total.value = 0;
    loadPage(1);
  },
  { immediate: true },
);
</script>

<style scoped>
.concerts-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-3);
  margin-bottom: var(--bd-space-4);
}

.concerts-country {
  min-width: 14rem;
}

.concerts-nearby {
  align-items: center;
  color: var(--bd-font-color-light);
  display: flex;
  gap: var(--bd-space-2);
  margin: 0 0 var(--bd-space-4);
  opacity: 0.7;

  &.found {
    color: var(--bd-primary-light);
    opacity: 1;
  }
}

.concerts-nearby-icon {
  height: 1rem;
  width: 1rem;
}

.concerts-loader {
  display: flex;
  justify-content: center;
  padding: var(--bd-space-6) 0;
}

.no-concerts {
  color: var(--bd-font-color-light);
  opacity: 0.6;
}

.concerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-2);
}

.concert-item {
  background-color: var(--bd-bg);
  border-left: 3px solid transparent;
  border-radius: var(--bd-radius-sm);

  &.upcoming {
    border-left-color: var(--bd-primary);
  }
}

.concert-summary {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: flex;
  gap: var(--bd-space-4);
  list-style: none;
  padding: var(--bd-space-3) var(--bd-space-4);
  transition: background-color var(--bd-transition-fast);

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    background-color: var(--bd-hover-overlay);
  }

  @media (--mobile) {
    flex-wrap: wrap;
    gap: var(--bd-space-2) var(--bd-space-4);
  }
}

.concert-date {
  color: var(--bd-font-color-light);
  flex: 0 0 7rem;

  .upcoming & {
    color: var(--bd-primary-light);
  }
}

.concert-info {
  flex: 1;
  min-width: 0;
}

.concert-location,
.concert-tour,
.concert-count {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-sm);
  opacity: 0.7;
}

.concert-tour {
  font-style: italic;
}

.concert-count {
  flex: 0 0 auto;
}

.concert-songs {
  columns: 2 16rem;
  margin: 0;
  padding: var(--bd-space-2) var(--bd-space-4) var(--bd-space-2) var(--bd-space-8);
}

.concert-link {
  align-items: center;
  color: var(--bd-font-color-light);
  display: inline-flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-2);
  padding: var(--bd-space-2) var(--bd-space-4) var(--bd-space-3);
}

.concert-link-icon {
  height: 0.8rem;
  width: 0.8rem;
}

.concerts-more {
  margin-top: var(--bd-space-4);
}
</style>
