<template>
  <div class="login">
    <div class="form">
      <img class="logo" src="/img/logo-long.svg" alt="" />
      <div>
        <a class="button button--primary" :href="connectUrl">Se connecter</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import type { RootState } from "../@types/RootState";
import { api } from "../api";
import { create } from "pkce";
import { Mutations } from "./auth/AuthStore";

interface Challenge {
  codeVerifier: string;
  codeChallenge: string;
}

const store = useStore<RootState>();
const code: Challenge = create();
const connectUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientId}&redirect_uri=${api.redirectUri}&scope=${api.scopes}&code_challenge_method=S256&code_challenge=${code.codeChallenge}`;

store.commit(Mutations.GENERATE_CODE_CHALLENGE, code);
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

@keyframes popLogin {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
}
.login {
  display: grid;
  place-content: center;
  height: 100%;
  position: fixed;
  z-index: 9;
  width: 100%;
  top: 0;
  background-color: #16181d;
  background-image: url("/img/bg-login.png");
  background-size: cover;
}

.form {
  animation: popLogin 1s ease both;
  text-align: center;
  padding: 50px;
  background-color: rgba(var(--primary-color), 0.1);
  border-radius: 5px;
  will-change: transform;
}

.logo {
  height: 50px;
  margin-bottom: 15px;
}
</style>
