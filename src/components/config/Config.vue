<template>
  <div v-if="configStore.show" ref="domConfig" class="config" :class="{ bye: configStore.bye }">
    <div class="user">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user__mail">{{ authStore.me?.email }}</div>
    </div>

    <div v-if="env !== 'production'" class="section">
      <div class="section__title">Debug</div>
      <router-link class="button button--full" to="/login">Login</router-link>
      <button class="button button--full" @click="authStore.refresh()">Refresh token</button>
      <button
        class="button button--full"
        @click="notification({ msg: 'DeviceNotInitialized', type: NotificationType.Error })"
      >
        Notif
      </button>
    </div>

    <div class="section">
      <div class="section__title">Compte</div>
      <button class="button button--full" @click="authStore.logout()">Se déconnecter</button>
    </div>

    <div class="section">
      <div class="section__title">Couleurs</div>
      <Colors />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Colors from "./Colors.vue";
import { notification } from "../../helpers/notifications";
import { useAuth } from "../../views/auth/AuthStore";
import { onClickOutside, templateRef } from "@vueuse/core";
import { useConfig } from "./ConfigStore";
import { NotificationType } from "../../@types/Notification";

const env = process.env.NODE_ENV;
const authStore = useAuth();
const configStore = useConfig();

onClickOutside(templateRef("domConfig"), () => configStore.close());
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
