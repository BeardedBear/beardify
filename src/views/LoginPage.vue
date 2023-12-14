<template>
  <div class="login">
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
      <div>
        <a
          :href="`https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientId}&redirect_uri=${api.redirectUri}&scope=${api.scopes}&code_challenge_method=S256&code_challenge=${challenge}`"
          class="button button--primary"
        >
          <i class="icon icon-spotify"></i>
          Connect with Spotify (Premium)
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { api } from "../api";
import router from "../router";
import { useAuth } from "./auth/AuthStore";

const authStore = useAuth();
const challenge = ref<string | undefined>(undefined);

authStore.generateStorage(router.currentRoute.value.query.ref?.toString());
challenge.value = useAuth().storage?.codeChallenge;
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

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
  font-size: 1.3rem;
  margin-right: 0.3rem;
  position: relative;
  top: 0.2rem;
}
</style>
