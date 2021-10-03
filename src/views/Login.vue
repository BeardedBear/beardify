<template>
  <div class="login">
    <div class="form">
      <img class="logo" src="/img/logo-long.svg" alt="" />
      <div>
        <a
          class="button button--primary"
          :href="`https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientId}&redirect_uri=${api.redirectUri}&scope=${api.scopes}&code_challenge_method=S256&code_challenge=${authStore.$state.auth.codeChallenge}`"
          >Se connecter</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { api } from "../api";
import { useAuth } from "./auth/AuthStore";

const authStore = useAuth();

authStore.generateCodeChallenge();
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
  background-color: #16181d;
  background-image: url("/img/bg-login.png");
  background-size: cover;
  display: grid;
  height: 100%;
  place-content: center;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
}

.form {
  animation: popLogin 1s ease both;
  background-color: rgba(var(--primary-color), 0.1);
  border-radius: 5px;
  padding: 50px;
  text-align: center;
  will-change: transform;
}

.logo {
  height: 50px;
  margin-bottom: 15px;
}
</style>
