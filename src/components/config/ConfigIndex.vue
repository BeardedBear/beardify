<template>
  <div :class="{ bye: configStore.bye }" class="config" ref="domConfig" v-if="configStore.show">
    <div class="user">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user-mail">{{ authStore.me?.email }}</div>
    </div>

    <div class="section" v-if="env !== 'production'">
      <div class="section-title">Debug</div>
      <ButtonIndex to="/login" variant="full">Login</ButtonIndex>
      <ButtonIndex variant="full" @click="authStore.refresh()">Refresh token</ButtonIndex>
      <ButtonIndex
        variant="full"
        @click="
          notification({
            msg: 'DeviceNotInitialized',
            type: NotificationType.Error,
          })
        "
      >
        Notif
      </ButtonIndex>
    </div>

    <div class="section">
      <div class="section-title">Account</div>
      <ButtonIndex :to="`/user/${authStore.me?.id}`" variant="full">My profile</ButtonIndex>
      <ButtonIndex variant="full" @click="authStore.logout()">Logout</ButtonIndex>
    </div>

    <div class="section">
      <div class="section-title">Colors</div>
      <Colors />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import Colors from "@/components/config/ColorsTheme.vue";
import { useConfig } from "@/components/config/ConfigStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { notification } from "@/helpers/notifications";
import { useAuth } from "@/views/auth/AuthStore";

const env = process.env.NODE_ENV;
const authStore = useAuth();
const configStore = useConfig();
const domConfig = ref<HTMLElement | null>(null);

onClickOutside(domConfig, (): void => configStore.close());
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/mixins" as *;

.section {
  background: var(--bg-color);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
  padding: 0.8rem;

  @include squircle;
}

.section-title {
  @include font-bold;

  font-size: var(--font-size-sm);
  opacity: 0.5;
  text-transform: uppercase;
}

.user {
  @include font-bold;

  margin-bottom: 1.2rem;
}

.user-mail {
  @include font-italic;

  font-size: var(--font-size-sm);
  margin-top: 0.1rem;
  opacity: 0.5;
}

@keyframes pop-config {
  from {
    opacity: 0;
    transform: translateY(-2rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bye-config {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-2rem);
  }
}

.config {
  animation: pop-config ease 0.2s both;
  background-color: var(--bg-color-darker);
  border-radius: 2.5rem;
  box-shadow: 0 0.5rem 0.5rem rgb(0 0 0 / 15%);
  padding: 1.2rem;
  position: absolute;
  right: 1.2rem;
  top: calc(100% - 0.3rem);
  width: 15rem;
  z-index: 999;

  @include squircle;

  &.bye {
    animation: bye-config ease 0.2s both;
  }
}
</style>
