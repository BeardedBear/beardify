<template>
  <div class="artist-concerts">
    <div v-if="loading" class="concerts-loader">
      <BdLoader size="small" />
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
        <div class="concert-date bd-font-bold">{{ date(event.dates.start.localDate) }}</div>
        <div class="concert-info">
          <div class="concert-venue bd-font-bold">{{ venue(event).name }}</div>
          <div class="concert-location">{{ location(event) }}</div>
        </div>
        <ExternalLink class="concert-link-icon" />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExternalLink } from "@lucide/vue";
import { BdLoader } from "bearded-ui";
import { onMounted, ref, watch } from "vue";

import { TicketmasterEvent, TicketmasterVenue } from "@/@types/Ticketmaster";
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

<style scoped>

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
  align-items: center;
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-sm);
  color: currentcolor;
  display: flex;
  gap: var(--bd-space-4);
  padding: var(--bd-space-3) var(--bd-space-4);
  text-decoration: none;
  transition: background-color var(--bd-transition-fast);

  &:hover {
    background-color: var(--bd-bg-dark);
  }
}

.concert-date {
  color: var(--bd-primary-light);
  flex: 0 0 7rem;
}

.concert-info {
  flex: 1;
  min-width: 0;
}

.concert-location {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-sm);
  opacity: 0.7;
}

.concert-link-icon {
  color: var(--bd-font-color-light);
  flex: 0 0 auto;
  height: 1rem;
  opacity: 0.5;
  width: 1rem;
}
</style>
