<template>
  <div ref="domConfig" class="config">
    <div class="user">
      <div>{{ authStore.me?.display_name }}</div>
      <div class="user__mail">
        {{ authStore.me?.email }}
      </div>
    </div>

    <div v-if="env !== 'production'" class="section">
      <div class="section__title">Debug</div>
      <router-link class="button button--full" to="/login"> Login </router-link>
      <button class="button button--full" @click="authStore.refresh()">Refresh token</button>
      <button class="button button--full" @click="randomNotif()">Notif</button>
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
import { ErrorType } from "../../@types/Error";
import { showError } from "../../helpers/errors";
import { useAuth } from "../../views/auth/AuthStore";
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";
import { useConfig } from "./ConfigStore";

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

function randomNotif(): void {
  showError(ErrorType.DeviceNotInitialized);
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
  border: 1px solid var(--bg-color-dark);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
  padding: 7px 10px 10px;

  &__title {
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.5;
    text-transform: uppercase;
  }
}

.user {
  margin-bottom: 20px;

  &__mail {
    font-size: 0.8rem;
    font-style: italic;
    margin-top: 2px;
    opacity: 0.5;
  }
}

.config {
  animation: pop-config ease 0.2s both;
  background-color: var(--bg-color-darker);
  border-radius: 4px;
  box-shadow: 0 5px 10px color.change(black, $alpha: 0.2);
  padding: 20px;
  position: absolute;
  right: 20px;
  top: calc(100% - 3px);
  width: 250px;
  z-index: 999;
}
</style>
