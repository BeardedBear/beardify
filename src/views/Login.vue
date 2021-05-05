<template>
  <div class="login">
    <div class="form">
      <img class="logo" src="/img/logo.svg" alt="" />
      <div><button class="button button--primary" type="button" @click="connect()">Se connecter</button></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../@types/rootStore";
import { connectUrl } from "../api";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function connect() {
      window.location.href = connectUrl;
    }

    return { connect, store };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.login {
  display: grid;
  place-content: center;
  height: 100%;
  position: fixed;
  z-index: 9;
  width: 100%;
  top: 0;
  background-color: #16181d;
}

.form {
  text-align: center;
  padding: 50px;
  background-color: rgba($primary-color, 0.1);
  border-radius: 5px;
}

.logo {
  height: 50px;
  margin-bottom: 15px;
}
</style>
