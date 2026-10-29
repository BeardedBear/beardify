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
          <template #icon><img :src="getCountryFlagUrl(country.code)" alt="" class="country-flag" /></template>
          {{ country.name }}
        </BdDropdownItem>
      </BdDropdown>
      <BdButton :disabled="locating" @click="locate">
        <MapPin />
        {{ configStore.homeLocation ? "Update my location" : "Use my location" }}
      </BdButton>
    </div>
    <p
      v-if="configStore.homeLocation && !loading && !eventsLoading"
      class="concerts-nearby"
      :class="{ found: nearbyCount }"
    >
      <MapPin class="concerts-nearby-icon" />
      {{
        nearbyCount
          ? `${nearbyCount} upcoming concert${nearbyCount > 1 ? "s" : ""} within ${NEAR_RADIUS_KM} km of you`
          : `No upcoming concert within ${NEAR_RADIUS_KM} km of you`
      }}
    </p>
    <div v-if="(loading || eventsLoading) && !setlists.length && !events.length" class="concerts-loader">
      <BdLoader size="small" />
    </div>
    <p v-else-if="!setlists.length && !events.length" class="no-concerts">
      No concerts found{{ configStore.concertCountry ? ` in ${getCountryName(configStore.concertCountry)}` : "" }}.
    </p>
    <template v-else>
      <section v-for="group in groups" :key="group.id" class="concerts-section" :class="group.id">
        <h3 class="concerts-heading bd-font-bold">
          {{ group.title }}
          <span class="concerts-heading-count">{{ group.count }}</span>
        </h3>
        <div class="concerts-list">
          <template v-if="group.id === 'upcoming'">
            <a
              v-for="event in events"
              :key="event.id"
              class="concert-item concert-summary upcoming"
              :href="event.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="concert-date bd-font-bold">{{ formatDate(event.dates.start.localDate) }}</div>
              <div class="concert-info">
                <div class="concert-venue bd-font-bold">{{ venue(event).name }}</div>
                <div class="concert-location">
                  <img
                    v-if="venue(event).country?.countryCode"
                    :src="getCountryFlagUrl(venue(event).country!.countryCode)"
                    alt=""
                    class="country-flag"
                  />
                  {{ eventLocation(event) }}
                </div>
              </div>
              <BdBadge v-if="isNear(eventCoords(event))" variant="success">
                Near you · {{ distance(eventCoords(event)) }} km
              </BdBadge>
              <BdBadge variant="primary">Tickets <ExternalLink class="concert-link-icon" /></BdBadge>
            </a>
          </template>
          <details
            v-for="setlist in group.setlists"
            :key="setlist.id"
            class="concert-item"
            :class="{ upcoming: isUpcoming(setlist.eventDate) }"
          >
            <summary class="concert-summary">
              <div class="concert-date bd-font-bold">{{ formatDate(setlistDate(setlist.eventDate)) }}</div>
              <div class="concert-info">
                <div class="concert-venue bd-font-bold">{{ setlist.venue.name }}</div>
                <div class="concert-location">
                  <img
                    v-if="setlist.venue.city?.country?.code"
                    :src="getCountryFlagUrl(setlist.venue.city.country.code)"
                    alt=""
                    class="country-flag"
                  />
                  {{ location(setlist) }}
                </div>
              </div>
              <div v-if="setlist.tour" class="concert-tour">{{ setlist.tour.name }}</div>
              <BdBadge v-if="group.id === 'upcoming' && isNear(setlistCoords(setlist))" variant="success">
                Near you · {{ distance(setlistCoords(setlist)) }} km
              </BdBadge>
              <div v-if="group.id === 'past'" class="concert-count">{{ songs(setlist).length || "No" }} songs</div>
            </summary>
            <ol v-if="songs(setlist).length" class="concert-songs">
              <li v-for="(song, index) in songs(setlist)" :key="index">{{ song }}</li>
            </ol>
            <a class="concert-link" :href="setlist.url" target="_blank" rel="noopener noreferrer">
              View on setlist.fm <ExternalLink class="concert-link-icon" />
            </a>
          </details>
        </div>
        <BdButton
          v-if="group.id === 'past' && setlists.length < total"
          class="concerts-more"
          :disabled="loading"
          @click="loadPage(page + 1)"
        >
          Load more
        </BdButton>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ChevronDown, ExternalLink, MapPin } from "@lucide/vue";
import { BdBadge, BdButton, BdDropdown, BdDropdownItem, BdLoader } from "bearded-ui";
import { computed, ref, watch } from "vue";

import { NotificationType } from "@/@types/Notification";
import { Coords, Setlist } from "@/@types/Setlistfm";
import { TicketmasterEvent, TicketmasterVenue } from "@/@types/Ticketmaster";
import { useConfig } from "@/components/config/ConfigStore";
import { countries, getCountryFlagUrl, getCountryName } from "@/helpers/country";
import { formatDate } from "@/helpers/date";
import { notification } from "@/helpers/notifications";
import { distanceKm, getSetlists, isUpcoming, setlistDate } from "@/helpers/setlistfm";
import { getTicketmasterEvents } from "@/helpers/ticketmaster";
import { useArtist } from "@/views/artist/ArtistStore";

// ponytail: fixed radius, make it a setting if people ask for "near" to mean something else
const NEAR_RADIUS_KM = 150;

const artistStore = useArtist();
const configStore = useConfig();
const setlists = ref<Setlist[]>([]);
const events = ref<TicketmasterEvent[]>([]);
const loading = ref(true);
const eventsLoading = ref(true);
const locating = ref(false);
const page = ref(0);
const total = ref(0);
let request = 0;
let eventsRequest = 0;

const countryList = countries();

// Ticketmaster has the ticket link, so its show wins over setlist.fm's announcement of the same date.
// ponytail: matched on date alone — an artist rarely plays twice the same day
const upcomingSetlists = computed(() => {
  const ticketed = new Set(events.value.map((event) => event.dates.start.localDate));
  return setlists.value
    .filter((setlist) => isUpcoming(setlist.eventDate) && !ticketed.has(setlistDate(setlist.eventDate)))
    .reverse(); // setlist.fm sends newest first; the next show should come first
});

const pastSetlists = computed(() => setlists.value.filter((setlist) => !isUpcoming(setlist.eventDate)));

// ponytail: Ticketmaster rows then setlist.fm rows, each sorted, not interleaved by date
const groups = computed(() =>
  [
    {
      count: events.value.length + upcomingSetlists.value.length,
      id: "upcoming",
      setlists: upcomingSetlists.value,
      title: "Upcoming concerts",
    },
    {
      count: total.value - setlists.value.filter((setlist) => isUpcoming(setlist.eventDate)).length,
      id: "past", setlists: pastSetlists.value,
      title: "Past concerts",
    },
  ].filter((group) => group.count),
);

// ponytail: counts loaded pages only — upcoming shows sit on page 1, newest first
const nearbyCount = computed(
  () =>
    events.value.filter((event) => isNear(eventCoords(event))).length
    + upcomingSetlists.value.filter((setlist) => isNear(setlistCoords(setlist))).length,
);

/** Distance from home to the venue in km, or null when either point is unknown. */
function distance(coords: Coords | null): null | number {
  const home = configStore.homeLocation;
  if (!coords || !home) return null;
  return Math.round(distanceKm(home, coords));
}

function eventCoords(event: TicketmasterEvent): Coords | null {
  const loc = venue(event).location;
  return loc ? { lat: Number(loc.latitude), lon: Number(loc.longitude) } : null;
}

function eventLocation(event: TicketmasterEvent): string {
  const v = venue(event);
  return [v.city?.name, v.state?.name, v.country?.name].filter(Boolean).join(", ");
}

function isNear(coords: Coords | null): boolean {
  const km = distance(coords);
  return km !== null && km <= NEAR_RADIUS_KM;
}

async function loadEvents(): Promise<void> {
  const id = ++eventsRequest;
  eventsLoading.value = true;
  const data = await getTicketmasterEvents(artistStore.artist.name, configStore.concertCountry);
  if (id !== eventsRequest) return;
  events.value = data;
  eventsLoading.value = false;
}

async function loadPage(next: number): Promise<void> {
  const mbid = artistStore.musicbrainzArtist?.id;
  const id = ++request;
  if (!mbid) {
    loading.value = false;
    return;
  }
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

function setlistCoords(setlist: Setlist): Coords | null {
  const coords = setlist.venue.city?.coords;
  return coords ? { lat: coords.lat, lon: coords.long } : null;
}

function songs(setlist: Setlist): string[] {
  return setlist.sets.set.flatMap((set) => set.song.filter((song) => song.name).map((song) => song.name));
}

function venue(event: TicketmasterEvent): TicketmasterVenue {
  return event._embedded?.venues?.[0] ?? { name: "Unknown venue" };
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

.no-concerts {
  color: var(--bd-font-color-light);
  opacity: 0.6;
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

  &.upcoming {
    border-left-color: var(--bd-primary);
  }
}

.concert-summary {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  color: currentcolor;
  cursor: pointer;
  display: flex;
  gap: var(--bd-space-4);
  list-style: none;
  padding: var(--bd-space-3) var(--bd-space-4);
  text-decoration: none;
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

.country-flag {
  border-radius: 0.1rem;
  height: 0.8em;
  margin-right: var(--bd-space-1);
  vertical-align: baseline;
  width: auto;
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
