<template>
  <div class="login">
    <div class="form">
      <img class="logo" src="/img/logo-long.svg" alt="" />
      <div class="pres">
        <b>Beardify</b> est un client Spotify web qui permet l'ajout de nouvelles fonctionnalités ainsi que des fix
        ergonomiques par rapport au client officiel :
        <ul>
          <li>Gérer des <b>collections d'albums</b></li>
          <li>Ergonomie plus claire</li>
          <li>Séparation nette entre les albums, les EP, et les singles</li>
          <li>Pouvoir basculer entre des themes <b>sombres</b> et <b>clairs</b></li>
        </ul>
      </div>
      <div>
        <a
          class="button button--primary"
          :href="`https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientId}&redirect_uri=${api.redirectUri}&scope=${api.scopes}&code_challenge_method=S256&code_challenge=${challenge}`"
        >
          <i class="icon icon-spotify"></i> Se connecter avec Spotify
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { api } from "../api";
import { useAuth } from "./auth/AuthStore";
import { ref } from "vue";
import router from "../router";

const authStore = useAuth();
const challenge = ref<string>("");

authStore.generateStorage(router.currentRoute.value.query.ref?.toString());
const storage = JSON.parse(localStorage.getItem("Beardify") || "");
challenge.value = storage.codeChallenge;
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
