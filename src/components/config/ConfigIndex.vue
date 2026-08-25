<template>
  <div class="config">
    <div class="user font-bold">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user-mail font-italic">
        {{ authStore.me?.email }}
      </div>
    </div>

    <!--
      Native <details> rather than BdCard: the section starts collapsed and the
      summary is the toggle, so no open-state JS is needed. Styled to match the
      surrounding cards.
    -->
    <details v-if="env !== 'production'" class="section debug-section">
      <summary class="debug-header">
        Debug
        <ChevronDown :size="14" />
      </summary>
      <div class="debug-body">
        <BdButton full align="left" to="/login">Login</BdButton>
        <BdButton full align="left" @click="authStore.refresh()">Refresh token</BdButton>
        <BdButton
          full
          align="left"
          @click="
            notification({
              msg: 'DeviceNotInitialized',
              type: NotificationType.Error,
            })
          "
        >
          Notif
        </BdButton>
        <BdButton full align="left" @click="updater.devSimulateUpdate()">Simulate update</BdButton>
      </div>
    </details>

    <BdCard class="section" padding="small">
      <template #header>Account</template>
      <BdButton
:to="`/user/${authStore.me?.id}`" full
        align="left"
>
My profile
</BdButton>
      <BdButton
full
        align="left" @click="authStore.logout()"
>
Logout
</BdButton>
    </BdCard>

    <BdCard class="section" padding="small">
      <template #header>Colors</template>
      <BdThemePicker accent-label="Accent" base-label="Background" />
    </BdCard>

    <BdCard class="section" padding="small">
      <template #header>Tier list</template>
      <BdCheckbox
        full-width
        label="Side labels"
        :model-value="configStore.tierListSideLabels"
        @update:model-value="configStore.toggleTierListSideLabels"
      />
    </BdCard>

    <div class="version">v{{ appVersion }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronDown } from "@lucide/vue";
import { BdButton, BdCard, BdCheckbox, BdThemePicker } from "bearded-ui";

import { NotificationType } from "@/@types/Notification";
import { useConfig } from "@/components/config/ConfigStore";
import { useUpdater } from "@/composables/useUpdater";
import { notification } from "@/helpers/notifications";
import { useAuth } from "@/views/auth/AuthStore";

const appVersion = __APP_VERSION__;
const env = import.meta.env.MODE;
const authStore = useAuth();
const configStore = useConfig();
const updater = useUpdater();
</script>

<style scoped>

.section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

/*
 * Mirrors the surrounding BdCards (`padding="small"`, surface background) so
 * the collapsed Debug row doesn't read as a foreign element.
 */
.debug-section {
  background-color: var(--bg-color-dark);
  border: 1px solid var(--bd-border-color);
  border-radius: var(--bd-radius-md);
  padding: var(--bd-space-3);
}

.debug-header {
  align-items: center;
  color: var(--font-color-light);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  list-style: none;
  user-select: none;

  &::-webkit-details-marker {
    display: none;
  }

  & > svg {
    transition: rotate 0.2s ease;
  }

  &:hover {
    color: var(--font-color);
  }
}

.debug-section[open] > .debug-header > svg {
  rotate: 180deg;
}

.debug-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.user {
  margin-bottom: 1.2rem;
}

.version {
  color: var(--font-color-dark);
  font-size: var(--font-size-xs);
  margin-top: 0.8rem;
  text-align: center;
}

.user-mail {
  color: var(--font-color-dark);
  font-size: var(--font-size-sm);
  margin-top: 0.1rem;
}

.config {
  display: flex;
  flex-direction: column;
  width: 22rem;
}
</style>
