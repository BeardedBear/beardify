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
      <BdButton v-if="!configStore.homeLocation" :disabled="locating" :loading="locating" @click="locate">
        <MapPin />
        Use my location
      </BdButton>
      <template v-else>
        <span class="concerts-radius">
          <BdInput
            v-model="radius"
            aria-label="Distance in km"
            min="1"
            type="number"
            :disabled="wholeCountry"
            @blur="radius = configStore.nearRadiusKm"
          />
          <span class="concerts-radius-unit" :class="{ disabled: wholeCountry }">km</span>
        </span>
        <!-- Held in place while the country resolves, so the row doesn't jump when the lookup lands -->
        <BdButton
          v-if="configStore.homeCountry || detectingCountry"
          :active="wholeCountry"
          :disabled="!configStore.homeCountry"
          :loading="detectingCountry"
          @click="configStore.nearWholeCountry = !configStore.nearWholeCountry"
        >
          <template v-if="configStore.homeCountry">
            <img :src="getCountryFlagUrl(configStore.homeCountry)" alt="" class="country-flag" />
            All of {{ getCountryName(configStore.homeCountry) }}
          </template>
          <template v-else>Detecting country…</template>
        </BdButton>
        <span class="concerts-location-actions">
          <BdButton icon-only label="Update my location" :loading="locating" @click="locate">
            <LocateFixed />
          </BdButton>
          <BdButton icon-only label="Forget my location" @click="forgetLocation">
            <MapPinOff />
          </BdButton>
        </span>
      </template>
    </div>
    <!-- Announced politely: radius and toggle changes rewrite it with no focus move -->
    <div
      v-if="configStore.homeLocation && !(busy && !upcoming.length)"
      class="concerts-nearby"
      aria-live="polite"
    >
      <BdButton v-if="filterHidesHome" size="small" @click="configStore.concertCountry = ''">
        <MapPin />
        Filtered to {{ getCountryName(configStore.concertCountry) }} · show all countries
      </BdButton>
      <template v-else>
        <BdButton v-if="nearbyCount" :active="nearOnly" size="small" variant="primary" @click="nearOnly = !nearOnly">
          <MapPin />
          {{ nearbyCount }} near you
        </BdButton>
        <span class="concerts-nearby-scope">
          {{ nearbyCount ? nearScope : `No upcoming concert ${nearScope}` }}
        </span>
      </template>
    </div>
    <p v-if="failed && sections.length" class="concerts-failed" role="status">
      Some concerts couldn't be loaded.
      <BdButton size="small" @click="retry">Try again</BdButton>
    </p>
    <div v-if="busy && !sections.length" class="concerts-loader">
      <BdLoader size="small" />
    </div>
    <BdEmptyState
      v-else-if="failed && !sections.length"
      action-label="Try again"
      message="Concerts may exist, we just couldn't reach the data sources."
      title="Couldn't load concerts"
      @action="retry"
    />
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
        <!--
          A Ticketmaster show has nothing to unfold (no songs, and its ticket link is the row's action), so it is a
          plain row: the link then sits beside the content instead of inside a <summary>, which is a button.
        -->
        <component
          :is="concert.source === 'ticketmaster' ? 'div' : 'details'"
          v-for="concert in section.concerts"
          :key="concert.id"
          class="concert-item"
        >
          <component :is="concert.source === 'ticketmaster' ? 'div' : 'summary'" class="concert-summary">
            <span class="concert-date bd-font-bold">{{ formatDate(concert.date) }}</span>
            <span class="concert-info">
              <span class="concert-venue bd-font-bold">{{ concert.venue }}</span>
              <span class="concert-location">
                <img
                  v-if="concert.countryCode"
                  :src="getCountryFlagUrl(concert.countryCode)"
                  alt=""
                  class="country-flag"
                />
                {{ concert.location }}
              </span>
            </span>
            <span v-if="concert.tour" class="concert-tour">{{ concert.tour }}</span>
            <BdBadge v-if="concert.nearKm !== null" variant="success">
              Near you{{ Number.isFinite(concert.nearKm) ? ` · ${concert.nearKm} km` : "" }}
            </BdBadge>
            <a
              v-if="concert.source === 'ticketmaster'"
              class="concert-tickets"
              :href="concert.url"
              rel="noopener noreferrer"
              target="_blank"
            >
              <BdBadge variant="primary">
                Tickets <span class="bd-sr-only">for {{ concert.venue }}, opens in a new tab</span>
                <ExternalLink class="concert-link-icon" />
              </BdBadge>
            </a>
            <span v-else-if="!section.upcoming" class="concert-count">
              {{ concert.songs.length || "No" }} song{{ concert.songs.length === 1 ? "" : "s" }}
            </span>
          </component>
          <template v-if="concert.source !== 'ticketmaster'">
            <ol v-if="concert.songs.length" class="concert-songs">
              <li v-for="(song, index) in concert.songs" :key="index">{{ song }}</li>
            </ol>
            <a class="concert-link" :href="concert.url" rel="noopener noreferrer" target="_blank">
              View on setlist.fm <span class="bd-sr-only">(opens in a new tab)</span>
              <ExternalLink class="concert-link-icon" />
            </a>
          </template>
        </component>
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
import { ChevronDown, ExternalLink, LocateFixed, MapPin, MapPinOff } from "@lucide/vue";
import { BdBadge, BdButton, BdDropdown, BdDropdownItem, BdEmptyState, BdInput, BdLoader } from "bearded-ui";
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";

import { NotificationType } from "@/@types/Notification";
import { Setlist } from "@/@types/Setlistfm";
import { TicketmasterEvent } from "@/@types/Ticketmaster";
import { useConfig } from "@/components/config/ConfigStore";
import { Concert, splitConcerts } from "@/helpers/concerts";
import { countries, countryAt, getCountryFlagUrl, getCountryName } from "@/helpers/country";
import { formatDate } from "@/helpers/date";
import { notification } from "@/helpers/notifications";
import { distanceKm, getSetlists } from "@/helpers/setlistfm";
import { getTicketmasterEvents } from "@/helpers/ticketmaster";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
const configStore = useConfig();
// Local copy: an emptied or zero field keeps the last valid radius instead of matching nothing
const radius = ref<number | string>(configStore.nearRadiusKm);
const wholeCountry = computed(() => configStore.nearWholeCountry && !!configStore.homeCountry);
const nearScope = computed(() =>
  wholeCountry.value
    ? `in ${getCountryName(configStore.homeCountry)}`
    : `within ${configStore.nearRadiusKm} km of you`,
);
// Shallow: the lists are only ever replaced, never mutated in place
const setlists = shallowRef<Setlist[]>([]);
const events = shallowRef<TicketmasterEvent[]>([]);
const setlistsLoading = ref(true);
const eventsLoading = ref(true);
const locating = ref(false);
const detectingCountry = ref(false);
// A failed request is not an empty one: keep them apart so a network error never reads as "no concerts"
const eventsFailed = ref(false);
const setlistsFailed = ref(false);
// ponytail: session-only, the chip is a quick look, not a preference worth persisting
const nearOnly = ref(false);
const page = ref(0);
const total = ref(0);
let setlistsController = new AbortController();
let eventsController = new AbortController();

const countryList = countries();

const busy = computed(() => setlistsLoading.value || eventsLoading.value);
const failed = computed(() => eventsFailed.value || setlistsFailed.value);
// The data only holds the filtered country, so a near count for another home country would be a false "none"
const filterHidesHome = computed(() => {
  const { concertCountry, homeCountry } = configStore;
  return !!concertCountry && !!homeCountry && concertCountry !== homeCountry;
});
const split = computed(() => splitConcerts(events.value, setlists.value));

// Distance computed once per row, not per render
const upcoming = computed(() => split.value.upcoming.map((concert) => ({ ...concert, nearKm: nearKm(concert) })));

// ponytail: counts loaded pages only — upcoming shows sit on page 1, newest first
const nearbyCount = computed(() => upcoming.value.filter((concert) => concert.nearKm !== null).length);

// Chip off when nothing is near (radius shrunk) so the list can't go empty behind an invisible toggle
const shownUpcoming = computed(() =>
  nearOnly.value && nearbyCount.value && !filterHidesHome.value
    ? upcoming.value.filter((concert) => concert.nearKm !== null)
    : upcoming.value,
);

const sections = computed(() =>
  [
    { concerts: shownUpcoming.value, count: shownUpcoming.value.length, title: "Upcoming concerts", upcoming: true },
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

async function detectHomeCountry(): Promise<void> {
  const home = configStore.homeLocation;
  if (!home) return;
  // Cleared first: a stale country from the previous location must not outlive a move
  configStore.homeCountry = "";
  detectingCountry.value = true;
  const code = await countryAt(home);
  detectingCountry.value = false;
  // Forgotten or moved again while the lookup was in flight
  if (configStore.homeLocation === home) configStore.homeCountry = code;
}

function forgetLocation(): void {
  configStore.homeLocation = null;
  configStore.homeCountry = "";
  configStore.nearWholeCountry = false;
  nearOnly.value = false;
}

async function loadEvents(): Promise<void> {
  eventsController.abort();
  const { signal } = (eventsController = new AbortController());
  // Cleared up front: the previous filter's shows must not linger, nor hide setlists by date
  events.value = [];
  eventsFailed.value = false;
  eventsLoading.value = true;
  const data = await getTicketmasterEvents(artistStore.artist.name, configStore.concertCountry, signal);
  if (signal.aborted) return;
  events.value = data ?? [];
  eventsFailed.value = !data;
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
  setlistsFailed.value = false;
  setlistsLoading.value = true;
  const data = await getSetlists(mbid, next, configStore.concertCountry, signal);
  // Artist or country changed while the request was in flight
  if (signal.aborted) return;
  if (data) {
    setlists.value = [...setlists.value, ...(data.setlist ?? [])];
    page.value = data.page;
    total.value = data.total;
  } else {
    setlistsFailed.value = true;
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
      detectHomeCountry();
    },
    () => {
      notification({ msg: "Couldn't get your location", type: NotificationType.Error });
      locating.value = false;
    },
    // Without a timeout, a dismissed Firefox prompt never calls back and the button stays disabled
    { maximumAge: 3_600_000, timeout: 10_000 },
  );
}

/**
 * Distance from home in km when the show counts as near; null when it doesn't.
 * Whole-country mode: any show in the home country, Infinity when its distance is unknown.
 */
function nearKm(concert: Concert): null | number {
  const home = configStore.homeLocation;
  if (!home) return null;
  const km = concert.coords ? Math.round(distanceKm(home, concert.coords)) : Infinity;
  if (wholeCountry.value) return concert.countryCode === configStore.homeCountry ? km : null;
  return km <= configStore.nearRadiusKm ? km : null;
}

/** Replays only what failed; `page` still points at the last good setlist page, so +1 is the one that never came. */
function retry(): void {
  if (eventsFailed.value) loadEvents();
  if (setlistsFailed.value) loadPage(page.value + 1);
}

watch(radius, (km) => {
  if (Number(km) > 0) configStore.nearRadiusKm = Number(km);
});

// Located before the country was stored
if (configStore.homeLocation && !configStore.homeCountry) detectHomeCountry();

watch(
  [() => artistStore.musicbrainzArtist?.id, () => configStore.concertCountry],
  () => {
    setlists.value = [];
    page.value = 0;
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

.concerts-radius {
  align-items: center;
  display: inline-flex;
  gap: var(--bd-space-2);
  width: 7rem;
}

/* The unit follows the number ("150 km"), so it sits beside the field, tight to it */
.concerts-radius-unit {
  color: var(--bd-font-color-light);

  &.disabled {
    opacity: 0.5;
  }
}

.concerts-location-actions {
  display: flex;
  gap: var(--bd-space-2);
  margin-left: auto;
}

.concerts-nearby {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
  margin-bottom: var(--bd-space-4);
}

/* Full opacity: the answer is what the bar is for, it must not read dimmer than its controls */
.concerts-nearby-scope {
  color: var(--bd-font-color-light);
}

.concerts-failed {
  align-items: center;
  color: var(--bd-font-color-light);
  display: flex;
  gap: var(--bd-space-3);
  margin: 0 0 var(--bd-space-4);
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
  display: flex;
  gap: var(--bd-space-4);
  list-style: none;
  padding: var(--bd-space-3) var(--bd-space-4);
  transition: background-color var(--bd-transition-fast);

  &::-webkit-details-marker {
    display: none;
  }

  @media (--mobile) {
    flex-wrap: wrap;
    gap: var(--bd-space-2) var(--bd-space-4);
  }
}

/* Only a real <summary> unfolds: a plain Ticketmaster row must not look clickable */
details > .concert-summary {
  cursor: pointer;

  &:hover {
    background-color: var(--bd-hover-overlay);
  }

  /* list-style: none and the custom radius drop the browser's own ring */
  &:focus-visible {
    outline: 2px solid var(--bd-primary);
    outline-offset: -2px;
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

/* Spans now (a <summary> only takes phrasing content), so the stacking is explicit */
.concert-venue,
.concert-location {
  display: block;
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
