<template>
  <div class="login">
    <Transition name="fade">
      <div v-if="waiting" class="waiting-overlay">
        <div class="waiting-card">
          <LoadingDots />
          <p class="waiting-label">Waiting for Spotify authorization…</p>
          <button class="button button-ghost" @click="cancelWaiting">Cancel</button>
        </div>
      </div>
    </Transition>

    <div class="form">
      <img alt="" class="logo" src="/img/logo-long.svg" />
      <div class="pres">
        <b>Beardify</b>
        is a web-based Spotify client that allows for the addition of new features and ergonomic fixes compared to the
        official client:
        <ul>
          <li>
            Manage
            <b>album collections</b>
            >
          </li>
          <li>Easier ergonomics</li>
          <li>Clear separation between studio albums, live albums (beta), EPs, and singles</li>
          <li>
            Be able to switch between
            <b>light</b>
            and
            <b>dark</b>
            themes
          </li>
        </ul>
      </div>
      <a
        :href="spotifyAuthUrl"
        class="button button-spotify"
        @click.prevent="handleLogin"
      >
        <i class="icon icon-spotify" />
        Connect with Spotify (Premium)
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import { api } from "@/api";
import LoadingDots from "@/components/ui/LoadingDots.vue";
import { clearAuthData } from "@/helpers/authUtils";
import { isTauri } from "@/helpers/platform";
import router, { RouteName } from "@/router";
import { useAuth } from "@/views/auth/AuthStore";

const authStore = useAuth();
const waiting = ref(false);

const spotifyAuthUrl = computed(
  () =>
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientId}&redirect_uri=${api.redirectUri}&scope=${api.scopes}&code_challenge_method=S256&code_challenge=${authStore.storage?.codeChallenge}`,
);

async function cancelWaiting(): Promise<void> {
  waiting.value = false;
  await refreshChallenge();
}

async function handleLogin(): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("open_spotify_auth", { url: spotifyAuthUrl.value });
    waiting.value = true;
  } else {
    window.location.href = spotifyAuthUrl.value;
  }
}

async function refreshChallenge(): Promise<void> {
  await authStore.generateStorage(router.currentRoute.value.query.ref?.toString());
}

(async () => {
  if (authStore.accessToken && authStore.storage?.refreshToken) {
    try {
      await authStore.refresh();
      router.push(RouteName.Home);
      return;
    } catch {
      clearAuthData();
    }
  }

  if (!authStore.storage?.codeChallenge || !authStore.storage?.codeVerifier) {
    await refreshChallenge();
  }
})();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;

@keyframes pop-login {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

b {
  color: var(--primary-color);
}

.login {
  background-color: #16181d;
  background-image: url("/img/bg-login.png");
  background-size: cover;
  display: grid;
  height: 100%;
  place-content: center;
  width: 100%;
}

.pres {
  margin-bottom: 3rem;
  text-align: left;
}

.form {
  animation: pop-login 1s ease both;
  background-color: rgb(var(--primary-color) 0.1);
  border-radius: 0.4rem;
  max-width: 35rem;
  padding: 2rem;
  text-align: center;
  will-change: transform;
}

.logo {
  height: 4rem;
  margin-bottom: 2rem;
}

.icon {
  font-size: 1.2rem;
}

.waiting-overlay {
  align-items: center;
  background-color: rgb(0 0 0 / 70%);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
}

.waiting-card {
  align-items: center;
  background-color: var(--bg-color-dark);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2.5rem 3rem;
}

.waiting-label {
  color: var(--font-color-light);
  font-size: var(--font-size-sm);
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
