<template>
  <div class="config">
    <div class="user font-bold">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user-mail font-italic">
        {{ authStore.me?.email }}
      </div>
    </div>

    <BdCard v-if="env !== 'production'" class="section" padding="small">
      <template #header>Debug</template>
      <BdButton
to="/login" full
        align="left"
>
Login
</BdButton>
      <BdButton
full
        align="left" @click="authStore.refresh()"
>
Refresh token
</BdButton>
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
    </BdCard>

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
import { BdButton, BdCard, BdCheckbox, BdThemePicker } from "bearded-ui";

import { NotificationType } from "@/@types/Notification";
import { useConfig } from "@/components/config/ConfigStore";
import { notification } from "@/helpers/notifications";
import { useAuth } from "@/views/auth/AuthStore";

const appVersion = __APP_VERSION__;
const env = import.meta.env.MODE;
const authStore = useAuth();
const configStore = useConfig();
</script>

<style scoped>

.section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

.user {
  margin-bottom: 1.2rem;
}

.version {
  font-size: var(--font-size-xs);
  margin-top: 0.8rem;
  opacity: 0.3;
  text-align: center;
}

.user-mail {
  font-size: var(--font-size-sm);
  margin-top: 0.1rem;
  opacity: 0.5;
}

.config {
  display: flex;
  flex-direction: column;
  width: 22rem;
}
</style>
