<template>
  <div class="content">
    <div v-for="month in releasesStore.monthGroups" :key="month.label" :data-month="month.label">
      <div class="month bd-font-bold">
        <span class="month-label">
          {{ month.label }}
          <span class="month-count">{{ month.releases.length }}</span>
        </span>
        <!--
          Only when the two numbers differ. With "Hide listened" on, every row left
          in the month is unheard, so the count beside the label already says it —
          and "42 · 42 unheard" reads as two facts rather than one repeated.
        -->
        <span v-if="month.unheard && month.unheard !== month.releases.length" class="month-unheard">
          {{ month.unheard }} unheard
        </span>
        <button
          v-if="month.unheard"
          class="month-heard"
          type="button"
          @click="markMonthHeard(month)"
        >
          <CheckCheck :size="14" />
          Mark heard
        </button>
      </div>
      <Release v-for="release in month.releases" :key="release.key" :release="release" />
    </div>
    <!--
      The feed stops at a month boundary, not at a scroll boundary, so nothing else
      in the page says the list is over. Without it the last row and a row cut off
      by a broken loader look the same.
    -->
    <p class="end">That is the whole feed.</p>
  </div>
</template>

<script lang="ts" setup>
import { CheckCheck } from "@lucide/vue";

import { MonthGroup } from "@/@types/Releases";
import Release from "@/components/releases/ReleaseIndex.vue";
import { notifyUndoable } from "@/helpers/notifications";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();

/**
 * Tick off a whole month, with a way back.
 *
 * The only action on this page that can destroy a session's worth of work in one
 * click — and with "Hide listened" on, the month it emptied is gone from the screen
 * that would let you undo it by hand. The toast is the undo; a confirmation dialog
 * would tax every correct click to protect the rare wrong one.
 * @param month - The month heading that was clicked
 */
function markMonthHeard(month: MonthGroup): void {
  const marked = releasesStore.markHeard(month.releases.map((release) => release.key));
  if (!marked.length) return;

  notifyUndoable(`${marked.length} marked as listened`, async (): Promise<void> => {
    releasesStore.unmarkHeard(marked);
  });
}
</script>

<style scoped>
.content {
  padding: 0 var(--bd-space-6) var(--bd-space-6);

  @media (--mobile) {
    padding: 0 var(--bd-space-2) var(--bd-space-2);
  }
}

.month {
  align-items: center;
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-3) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.month-label {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
}

.month-count {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  padding: 0 var(--bd-space-2);
}

.month-unheard {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  margin-inline-start: auto;
  text-transform: none;
}

/* Pushed right on its own; the unheard count takes that job when it is there. */
.month-heard {
  align-items: center;
  background: none;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-dark);
  cursor: pointer;
  display: inline-flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-1);
  margin-inline-start: auto;
  padding: var(--bd-space-1) var(--bd-space-2);

  &:hover {
    background-color: var(--bd-bg-light);
    color: var(--bd-font-color-light);
  }
}

.month-unheard + .month-heard {
  margin-inline-start: 0;
}

.end {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  padding: var(--bd-space-6) var(--bd-space-2) 0;
  text-align: center;
}
</style>
