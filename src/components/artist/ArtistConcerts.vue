<template>
  <div class="artist-concerts">
    <div v-if="loading" class="concerts-loader">
      <LoadingDots size="small" />
    </div>
    <p v-else-if="!events.length" class="no-concerts">No upcoming concerts found.</p>
    <div v-else class="concerts-list">
      <a
        v-for="event in events"
        :key="event.id"
        class="concert-item"
        :href="event.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="concert-date">{{ date(event.dates.start.localDate) }}</div>
        <div class="concert-info">
          <div class="concert-venue">{{ venue(event).name }}</div>
          <div class="concert-location">{{ location(event) }}</div>
        </div>
        <ExternalLink class="concert-link-icon" />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExternalLink } from "@lucide/vue";
import { onMounted, ref, watch } from "vue";

import { TicketmasterEvent, TicketmasterVenue } from "@/@types/Ticketmaster";
import LoadingDots from "@/components/ui/LoadingDots.vue";
import { date } from "@/helpers/date";
import { getTicketmasterEvents } from "@/helpers/ticketmaster";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
const events = ref<TicketmasterEvent[]>([]);
const loading = ref(true);

async function loadEvents(): Promise<void> {
  loading.value = true;
  events.value = await getTicketmasterEvents(artistStore.artist.name);
  loading.value = false;
}

function location(event: TicketmasterEvent): string {
  const v = venue(event);
  return [v.city?.name, v.state?.name, v.country?.name].filter(Boolean).join(", ");
}

function venue(event: TicketmasterEvent): TicketmasterVenue {
  return event._embedded?.venues?.[0] ?? { name: "Unknown venue" };
}

watch(() => artistStore.artist.name, loadEvents);
onMounted(loadEvents);
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.concerts-loader {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.no-concerts {
  color: var(--font-color-light);
  opacity: 0.6;
}

.concerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.concert-item {
  align-items: center;
  background-color: var(--bg-color);
  border-radius: 0.3rem;
  color: currentcolor;
  display: flex;
  gap: 1.2rem;
  padding: 0.8rem 1rem;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-color-dark);
  }
}

.concert-date {
  @include font-bold;

  color: var(--primary-color-light);
  flex: 0 0 7rem;
}

.concert-info {
  flex: 1;
  min-width: 0;
}

.concert-venue {
  @include font-bold;
}

.concert-location {
  color: var(--font-color-light);
  font-size: var(--font-size-sm);
  opacity: 0.7;
}

.concert-link-icon {
  color: var(--font-color-light);
  flex: 0 0 auto;
  height: 1rem;
  opacity: 0.5;
  width: 1rem;
}
</style>
