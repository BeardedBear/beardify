<template>
  <div class="login">
    <Transition name="fade">
      <div v-if="waiting" class="waiting-overlay">
        <div class="waiting-card">
          <BdLoader />
          <p class="waiting-label">Waiting for Spotify authorization…</p>
          <BdButton variant="border" @click="cancelWaiting">Cancel</BdButton>
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
      <BdButton
        class="spotify"
        :href="spotifyAuthUrl"
        size="big"
        @click.prevent="handleLogin"
      >
        <i class="icon icon-spotify" />
        Connect with Spotify (Premium)
      </BdButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdLoader } from "bearded-ui";
import { computed, ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import { api } from "@/api";
import { clearAuthData } from "@/helpers/authUtils";
import { notification } from "@/helpers/notifications";
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
    try {
      await invoke("open_spotify_auth", { url: spotifyAuthUrl.value });
    } catch {
      notification({ msg: "Unable to open the Spotify login page", type: NotificationType.Error });
      return;
    }
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

<style scoped>

.spotify {
  background-color: #1db954;
  color: #fff;

  &:hover {
    background-color: #1ed760;
    color: #fff;
  }
}

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
  color: var(--bd-primary);
}

.login {
  background-color: var(--bd-bg-darker);
  background-image: url("/img/bg-login.png");
  background-size: cover;
  display: grid;
  height: 100%;
  place-content: center;
  width: 100%;
}

.pres {
  margin-bottom: var(--bd-space-7);
  text-align: left;
}

/*
 * `rgb(var(--bd-primary) 0.1)` used to sit here. --primary-color resolves to
 * a whole color, not the three channels rgb() wants, so the declaration was
 * invalid and dropped on the floor — this card has been rendering with no
 * background at all. color-mix() is the syntax that actually takes a color.
 */
.form {
  animation: pop-login 1s ease both;
  background-color: color-mix(in oklab, var(--bd-primary) 12%, var(--bd-bg-dark));
  border-radius: var(--bd-radius-sm);
  max-width: 35rem;
  padding: var(--bd-space-6);
  text-align: center;
}

.logo {
  height: 4rem;
  margin-bottom: var(--bd-space-6);
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
  background-color: var(--bd-bg-dark);
  border-radius: var(--bd-radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-4);
  padding: var(--bd-space-6) var(--bd-space-7);
}

.waiting-label {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-sm);
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--bd-transition);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
