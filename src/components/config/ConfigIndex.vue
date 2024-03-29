<template>
  <div :class="{ bye: configStore.bye }" class="config" ref="domConfig" v-if="configStore.show">
    <div class="user">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user__mail">{{ authStore.me?.email }}</div>
    </div>

    <div class="section" v-if="env !== 'production'">
      <div class="section__title">Debug</div>
      <router-link class="button button--full" to="/login">Login</router-link>
      <button @click="authStore.refresh()" class="button button--full">Refresh token</button>
      <button
        @click="
          notification({
            msg: 'DeviceNotInitialized',
            type: NotificationType.Error,
          })
        "
        class="button button--full"
      >
        Notif
      </button>
    </div>

    <div class="section">
      <div class="section__title">Account</div>
      <router-link :to="`/user/${authStore.me?.id}`" class="button button--full">My profile</router-link>
      <button @click="authStore.logout()" class="button button--full">Logout</button>
    </div>

    <div class="section">
      <div class="section__title">Colors</div>
      <Colors />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";
import { RouterLink } from "vue-router";

import { NotificationType } from "../../@types/Notification";
import { notification } from "../../helpers/notifications";
import { useAuth } from "../../views/auth/AuthStore";
import Colors from "./ColorsTheme.vue";
import { useConfig } from "./ConfigStore";

const env = process.env.NODE_ENV;
const authStore = useAuth();
const configStore = useConfig();
const domConfig = ref<HTMLElement | null>(null);

onClickOutside(domConfig, (): void => configStore.close());
</script>

<style lang="scss" scoped>
@use "sass:color";

.section {
  background: var(--bg-color);
  border-radius: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
  padding: 0.8rem;

  &__title {
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.5;
    text-transform: uppercase;
  }
}

.user {
  font-weight: bold;
  margin-bottom: 1.2rem;

  &__mail {
    font-size: 0.9rem;
    font-style: italic;
    font-weight: 400;
    margin-top: 0.1rem;
    opacity: 0.5;
  }
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
  border-radius: 1rem;
  box-shadow: 0 0.5rem 0.5rem rgb(0 0 0 / 15%);
  padding: 1.2rem;
  position: absolute;
  right: 1.2rem;
  top: calc(100% - 0.3rem);
  width: 15rem;
  z-index: 999;

  &.bye {
    animation: bye-config ease 0.2s both;
  }
}
</style>
