<template>
  <div class="artist-concerts">
    <div class="concerts-toolbar">
      <BdDropdown match-width searchable>
        <template #trigger>
          <BdButton class="concerts-country">
            <img
              v-if="configStore.concertCountry"
              :src="getCountryFlagUrl(configStore.concertCountry)"
              alt=""
              class="country-flag"
            />
            {{ configStore.concertCountry ? getCountryName(configStore.concertCountry) : "All countries" }}
            <ChevronDown class="concerts-country-caret" />
          </BdButton>
        </template>
        <BdDropdownItem :active="!configStore.concertCountry" @click="configStore.concertCountry = ''">
          All countries
        </BdDropdownItem>
        <BdDropdownItem
          v-for="country in countryList"
          :key="country.code"
          :active="configStore.concertCountry === country.code"
          @click="configStore.concertCountry = country.code"
        >
          <template #icon>
            <!-- lazy: the closed panel still mounts every item, ~250 flags would load on tab open -->
            <img :src="getCountryFlagUrl(country.code)" alt="" class="country-flag" loading="lazy" />
          </template>
          {{ country.name }}
        </BdDropdownItem>
      </BdDropdown>
      <BdButton :disabled="locating" @click="locate">
        <MapPin />
        {{ configStore.homeLocation ? "Update my location" : "Use my location" }}
      </BdButton>
    </div>
    <p v-if="configStore.homeLocation && !busy" class="concerts-nearby" :class="{ found: nearbyCount }">
      <MapPin class="concerts-nearby-icon" />
      {{
        nearbyCount
          ? `${nearbyCount} upcoming concert${nearbyCount > 1 ? "s" : ""} within ${NEAR_RADIUS_KM} km of you`
          : `No upcoming concert within ${NEAR_RADIUS_KM} km of you`
      }}
    </p>
    <div v-if="busy && !sections.length" class="concerts-loader">
      <BdLoader size="small" />
    </div>
    <BdEmptyState v-else-if="!sections.length" :title="emptyTitle" />
    <section
      v-for="section in sections"
      v-else
      :key="section.title"
      class="concerts-section"
      :class="{ upcoming: section.upcoming }"
    >
      <h3 class="concerts-heading bd-font-bold">
        {{ section.title }} <span class="concerts-heading-count">{{ section.count }}</span>
      </h3>
      <div class="concerts-list">
        <details v-for="concert in section.concerts" :key="concert.id" class="concert-item">
          <summary class="concert-summary">
            <div class="concert-date bd-font-bold">{{ formatDate(concert.date) }}</div>
            <div class="concert-info">
              <div class="concert-venue bd-font-bold">{{ concert.venue }}</div>
              <div class="concert-location">
                <img
                  v-if="concert.countryCode"
                  :src="getCountryFlagUrl(concert.countryCode)"
                  alt=""
                  class="country-flag"
                />
                {{ concert.location }}
              </div>
            </div>
            <div v-if="concert.tour" class="concert-tour">{{ concert.tour }}</div>
            <BdBadge v-if="concert.nearKm !== null" variant="success">Near you · {{ concert.nearKm }} km</BdBadge>
            <a
              v-if="concert.source === 'ticketmaster'"
              class="concert-tickets"
              :href="concert.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BdBadge variant="primary">Tickets <ExternalLink class="concert-link-icon" /></BdBadge>
            </a>
            <div v-else-if="!section.upcoming" class="concert-count">{{ concert.songs.length || "No" }} songs</div>
          </summary>
          <ol v-if="concert.songs.length" class="concert-songs">
            <li v-for="(song, index) in concert.songs" :key="index">{{ song }}</li>
          </ol>
          <a class="concert-link" :href="concert.url" target="_blank" rel="noopener noreferrer">
            {{ concert.source === "ticketmaster" ? "Buy tickets on Ticketmaster" : "View on setlist.fm" }}
            <ExternalLink class="concert-link-icon" />
          </a>
        </details>
      </div>
      <BdButton
        v-if="!section.upcoming && setlists.length < total"
        class="concerts-more"
        :disabled="setlistsLoading"
        @click="loadPage(page + 1)"
      >
        Load more
      </BdButton>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ChevronDown, ExternalLink, MapPin } from "@lucide/vue";
import { BdBadge, BdButton, BdDropdown, BdDropdownItem, BdEmptyState, BdLoader } from "bearded-ui";
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";

import { NotificationType } from "@/@types/Notification";
import { Setlist } from "@/@types/Setlistfm";
import { TicketmasterEvent } from "@/@types/Ticketmaster";
import { useConfig } from "@/components/config/ConfigStore";
import { Concert, splitConcerts } from "@/helpers/concerts";
import { countries, getCountryFlagUrl, getCountryName } from "@/helpers/country";
import { formatDate } from "@/helpers/date";
import { notification } from "@/helpers/notifications";
import { distanceKm, getSetlists } from "@/helpers/setlistfm";
import { getTicketmasterEvents } from "@/helpers/ticketmaster";
import { useArtist } from "@/views/artist/ArtistStore";

// ponytail: fixed radius, make it a setting if people ask for "near" to mean something else
const NEAR_RADIUS_KM = 150;

const artistStore = useArtist();
const configStore = useConfig();
// Shallow: the lists are only ever replaced, never mutated in place
const setlists = shallowRef<Setlist[]>([]);
const events = shallowRef<TicketmasterEvent[]>([]);
const setlistsLoading = ref(true);
const eventsLoading = ref(true);
const locating = ref(false);
const page = ref(0);
const total = ref(0);
let setlistsController = new AbortController();
let eventsController = new AbortController();

const countryList = countries();

const busy = computed(() => setlistsLoading.value || eventsLoading.value);
const split = computed(() => splitConcerts(events.value, setlists.value));

// Distance computed once per row, not per render
const upcoming = computed(() => split.value.upcoming.map((concert) => ({ ...concert, nearKm: nearKm(concert) })));

// ponytail: counts loaded pages only — upcoming shows sit on page 1, newest first
const nearbyCount = computed(() => upcoming.value.filter((concert) => concert.nearKm !== null).length);

const sections = computed(() =>
  [
    { concerts: upcoming.value, count: upcoming.value.length, title: "Upcoming concerts", upcoming: true },
    {
      concerts: split.value.past.map((concert) => ({ ...concert, nearKm: null })),
      // setlist.fm's total spans upcoming shows too; every upcoming one sits in the loaded first page
      count: total.value - (setlists.value.length - split.value.past.length),
      title: "Past concerts",
      upcoming: false,
    },
  ].filter((section) => section.count),
);

const emptyTitle = computed(() =>
  configStore.concertCountry
    ? `No concerts found in ${getCountryName(configStore.concertCountry)}`
    : "No concerts found",
);

async function loadEvents(): Promise<void> {
  eventsController.abort();
  const { signal } = (eventsController = new AbortController());
  // Cleared up front: the previous filter's shows must not linger, nor hide setlists by date
  events.value = [];
  eventsLoading.value = true;
  const data = await getTicketmasterEvents(artistStore.artist.name, configStore.concertCountry, signal);
  if (signal.aborted) return;
  events.value = data;
  eventsLoading.value = false;
}

async function loadPage(next: number): Promise<void> {
  const mbid = artistStore.musicbrainzArtist?.id;
  setlistsController.abort();
  const { signal } = (setlistsController = new AbortController());
  if (!mbid) {
    setlistsLoading.value = false;
    return;
  }
  setlistsLoading.value = true;
  const data = await getSetlists(mbid, next, configStore.concertCountry, signal);
  // Artist or country changed while the request was in flight
  if (signal.aborted) return;
  if (data) {
    setlists.value = [...setlists.value, ...(data.setlist ?? [])];
    page.value = data.page;
    total.value = data.total;
  }
  setlistsLoading.value = false;
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
    // Without a timeout, a dismissed Firefox prompt never calls back and the button stays disabled
    { maximumAge: 3_600_000, timeout: 10_000 },
  );
}

/** Distance from home in km when within the radius; null when farther or either point is unknown. */
function nearKm(concert: Concert): null | number {
  const home = configStore.homeLocation;
  if (!concert.coords || !home) return null;
  const km = Math.round(distanceKm(home, concert.coords));
  return km <= NEAR_RADIUS_KM ? km : null;
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

watch([() => artistStore.artist.name, () => configStore.concertCountry], loadEvents, { immediate: true });

onBeforeUnmount(() => {
  setlistsController.abort();
  eventsController.abort();
});
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
  justify-content: flex-start;
  min-width: 14rem;
}

.concerts-country-caret {
  height: 1em;
  margin-left: auto;
  width: 1em;
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

.concerts-section + .concerts-section {
  border-top: 1px solid var(--bd-border-color);
  margin-top: var(--bd-space-6);
  padding-top: var(--bd-space-6);
}

.concerts-heading {
  align-items: baseline;
  display: flex;
  font-size: var(--bd-font-size-lg);
  gap: var(--bd-space-2);
  margin: 0 0 var(--bd-space-3);

  .upcoming & {
    color: var(--bd-primary-light);
  }
}

.concerts-heading-count {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-sm);
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

  .upcoming & {
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

.concert-tickets {
  display: inline-flex;
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
