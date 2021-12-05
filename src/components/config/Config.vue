<template>
  <div ref="domConfig" class="config">
    <div class="user">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user__mail">{{ authStore.me?.email }}</div>
    </div>

    <div v-if="env !== 'production'" class="section">
      <div class="section__title">Debug</div>
      <router-link class="button button--full" to="/login"> Login </router-link>
      <button class="button button--full" @click="authStore.refresh()">Refresh token</button>
      <button
        class="button button--full"
        @click="notification({ msg: 'DeviceNotInitialized', type: NotificationType.Error })"
      >
        Notif
      </button>
    </div>

    <button class="button button--full" @click="logout()">Logout</button>

    <div class="section">
      <div class="section__title">Couleurs</div>
      <Colors />
    </div>
  </div>
</template>

<script lang="ts" setup>
import router, { RouteName } from "../../router";
import Colors from "./Colors.vue";
import { notification } from "../../helpers/notifications";
import { useAuth } from "../../views/auth/AuthStore";
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";
import { useConfig } from "./ConfigStore";
import { NotificationType } from "../../@types/Notification";

const env = process.env.NODE_ENV;
const authStore = useAuth();
const domConfig = ref(null);
const configStore = useConfig();

onClickOutside(domConfig, () => configStore.close());

function logout(): void {
  configStore.close();
  authStore.resetLogin();
  router.push(RouteName.Login);
}
</script>

<style lang="scss" scoped>
@use "sass:color";

@keyframes pop-config {
  from {
    opacity: 0;
    transform: scale(0);
    transform-origin: top right;
  }
}

.section {
  background: var(--bg-color-light);
  border: 0.1rem solid var(--bg-color-dark);
  border-radius: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin: 1rem 0;
  padding: 0.5rem 0.8rem 0.8rem;

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

.config {
  animation: pop-config ease 0.2s both;
  background-color: var(--bg-color-darker);
  border-radius: 0.3rem;
  box-shadow: 0 0.3rem 0.7rem color.change(black, $alpha: 0.2);
  padding: 1.2rem;
  position: absolute;
  right: 1.2rem;
  top: calc(100% - 0.3rem);
  width: 15rem;
  z-index: 999;
}
</style>
