<template>
  <span
    ref="wrapperRef"
    class="member-popover-wrapper"
    @focusin="open"
    @focusout="scheduleClose"
    @mouseenter="open"
    @mouseleave="scheduleClose"
  >
    <slot />

    <Teleport to="body">
      <transition name="member-popover">
        <div
          v-if="visible"
          ref="panelRef"
          class="member-popover"
          :style="panelStyle"
          role="tooltip"
          @mouseenter="cancelClose"
          @mouseleave="scheduleClose"
        >
          <div class="mp-layout">
            <div class="mp-photo-col">
              <img v-if="image" :src="image" :alt="name" class="mp-photo" />
              <div
                v-else
                class="mp-photo mp-photo-placeholder"
                :style="{ background: `hsl(${avatarHue}, 35%, 28%)` }"
              >
                <span class="mp-initials">{{ initials }}</span>
              </div>
            </div>

            <div class="mp-info-col">
              <strong class="mp-name">{{ name }}</strong>
              <span v-if="info?.realName && info.realName !== name" class="mp-realname">
                {{ info.realName }}
              </span>

              <div v-if="loading" class="mp-state">Loading…</div>
              <template v-else-if="info">
                <div v-if="displayedGroups.length" class="mp-section">
                  <span class="mp-section-title">Member of</span>
                  <ul class="mp-groups">
                    <li v-for="group in displayedGroups" :key="group.name" :class="{ former: !group.active }">
                      <button class="mp-group-name" type="button" @click="searchGroup(group.name)">
                        {{ group.name }}
                      </button>
                      <span v-if="!group.active" class="mp-former">former</span>
                    </li>
                  </ul>
                </div>
                <a
                  v-if="info.profileUrl"
                  class="mp-link"
                  :href="info.profileUrl"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <i class="icon-discogs" /> Discogs
                </a>
              </template>
              <div v-else class="mp-state">No additional info.</div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </span>
</template>

<script lang="ts" setup>
import { useElementBounding, useEventListener, useWindowSize } from "@vueuse/core";
import { computed, nextTick, ref } from "vue";

import type { MemberInfo } from "@/@types/Artist";

import { useDialog } from "@/components/dialog/DialogStore";
import { useSearch } from "@/components/search/SearchStore";
import { getDiscogsMemberInfo } from "@/helpers/discogs";

const props = defineProps<{
  discogsId?: null | number;
  name: string;
  thumbnail?: null | string;
}>();

const GAP = 12;
const MARGIN = 8;
const PANEL_WIDTH = 350;
const CLOSE_DELAY = 120;
const MAX_GROUPS = 8;

const visible = ref(false);
const loading = ref(false);
const loaded = ref(false);
const info = ref<MemberInfo | null>(null);
const panelStyle = ref<Record<string, string>>({});

const wrapperRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let loadTimer: ReturnType<typeof setTimeout> | undefined;

const LOAD_DELAY = 250;

const { height: viewportHeight, width: viewportWidth } = useWindowSize();
const { height: wrapHeight, width: wrapWidth, x: wrapLeft, y: wrapTop } = useElementBounding(wrapperRef);
const { height: panelHeight } = useElementBounding(panelRef);

const image = computed(() => info.value?.image || props.thumbnail || null);

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join(""),
);

// Deterministic hue from name so each member gets a consistent color
const avatarHue = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.name.length; i++) hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
});

// Active groups first, current band(s) and self excluded already handled upstream
const displayedGroups = computed(() => {
  if (!info.value) return [];
  return [...info.value.groups]
    .sort((a, b) => Number(b.active) - Number(a.active))
    .slice(0, MAX_GROUPS);
});

function cancelClose(): void {
  if (closeTimer) clearTimeout(closeTimer);
}

function cancelLoad(): void {
  if (loadTimer) clearTimeout(loadTimer);
}

async function loadInfo(): Promise<void> {
  if (loaded.value) return;
  loaded.value = true;
  loading.value = true;
  info.value = await getDiscogsMemberInfo({ discogsId: props.discogsId ?? null, name: props.name });
  loading.value = false;
  nextTick(updatePosition);
}

function open(): void {
  cancelClose();
  visible.value = true;
  nextTick(updatePosition);
  // Debounce the network lookup so sweeping the mouse over the list does not
  // fire a Discogs request per member
  if (!loaded.value) {
    cancelLoad();
    loadTimer = setTimeout(loadInfo, LOAD_DELAY);
  }
}

function scheduleClose(): void {
  cancelClose();
  cancelLoad();
  closeTimer = setTimeout(() => {
    visible.value = false;
  }, CLOSE_DELAY);
}

function searchGroup(name: string): void {
  visible.value = false;
  const dialog = useDialog();
  const search = useSearch();
  search.updateQuery(name);
  dialog.open({ type: "search" });
}

function updatePosition(): void {
  const vpW = viewportWidth.value || window.innerWidth;
  const vpH = viewportHeight.value || window.innerHeight;

  // Prefer the right side; flip left when there is not enough room
  const spaceRight = vpW - (wrapLeft.value + wrapWidth.value) - GAP;
  const left
    = spaceRight >= PANEL_WIDTH + MARGIN
      ? wrapLeft.value + wrapWidth.value + GAP
      : Math.max(wrapLeft.value - PANEL_WIDTH - GAP, MARGIN);

  const panelH = panelHeight.value || 0;
  const desiredTop = wrapTop.value + wrapHeight.value / 2 - panelH / 2;
  const top = Math.min(Math.max(desiredTop, MARGIN), Math.max(vpH - panelH - MARGIN, MARGIN));

  panelStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${PANEL_WIDTH}px`,
  };
}

useEventListener(window, "scroll", () => visible.value && updatePosition(), { capture: true });
useEventListener(window, "resize", () => visible.value && updatePosition());
</script>

<style lang="scss">
/* Unscoped: the popover is teleported to <body> */
.member-popover {
  background: var(--bg-color-dark);
  border: 1px solid var(--bg-color-lighter);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 45%);
  color: var(--font-color-light);
  overflow: hidden;
  padding: 0;
  position: fixed;
  z-index: 10000;
}

.member-popover .mp-layout {
  display: flex;
  min-height: 140px;
}

.member-popover .mp-photo-col {
  flex-shrink: 0;
  width: 150px;
}

.member-popover .mp-photo {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.member-popover .mp-photo-placeholder {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
}

.member-popover .mp-initials {
  color: rgb(255 255 255 / 80%);
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1;
  user-select: none;
}

.member-popover .mp-info-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.75rem;
}

.member-popover .mp-section {
  width: 100%;
}

.member-popover .mp-name {
  color: var(--font-color-default);
  font-size: var(--font-size-base);
}

.member-popover .mp-realname {
  font-size: var(--font-size-xs);
  opacity: 0.6;
}

.member-popover .mp-section-title {
  display: block;
  font-size: var(--font-size-xs);
  margin-bottom: 0.3rem;
  margin-top: 1rem;
  opacity: 0.5;
  text-transform: uppercase;
}

.member-popover .mp-groups {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  list-style: none;
  margin: 0;
  max-height: 12rem;
  overflow-y: auto;
  padding: 0;
  margin-bottom: 1rem;

  li {
    align-items: baseline;
    display: flex;
    flex: 1;
    font-size: var(--font-size-sm);
    gap: 0.4rem;
    justify-content: space-between;

    &.former {
      /* opacity: 0.55; */
    }
  }
}

.member-popover .mp-group-name {
  appearance: none;
  background: none;
  border: none;
  color: var(--font-color-default);
  cursor: pointer;
  flex: 1;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--primary-color-light);
    text-decoration: underline;
  }
}

.member-popover .mp-former {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  font-style: italic;
  opacity: 0.7;
}

.member-popover .mp-link {
  align-items: center;
  color: var(--primary-color-light);
  display: inline-flex;
  font-size: var(--font-size-sm);
  gap: 0.3rem;
  margin-top: 0.6rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.member-popover .mp-state {
  font-size: var(--font-size-sm);
  opacity: 0.6;
}

.member-popover-enter-active,
.member-popover-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.member-popover-enter-from,
.member-popover-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
