<template>
  <div class="config">
    <div class="user">
      <div>{{ store.state.auth.me.display_name }}</div>
      <div class="user__mail">{{ store.state.auth.me.email }}</div>
    </div>
    <div class="links">
      <router-link class="links__item button" to="/login">Login</router-link>
    </div>

    <div class="schemes">
      <button
        class="schemes__item default"
        @click="schemeDefault()"
        :class="{ current: store.state.config.schemeLabel === 'default' }"
      ></button>
      <button
        class="schemes__item blue"
        @click="schemeBlue()"
        :class="{ current: store.state.config.schemeLabel === 'blue' }"
      ></button>
      <button
        class="schemes__item crimson"
        @click="schemeCrimson()"
        :class="{ current: store.state.config.schemeLabel === 'crimson' }"
      ></button>
      <button
        class="schemes__item apple"
        @click="schemeApple()"
        :class="{ current: store.state.config.schemeLabel === 'apple' }"
      ></button>
    </div>

    <div>
      <div class="radio">
        <button
          class="radio__item"
          @click="switchThemeLight()"
          :class="{ current: store.state.config.themeLabel === 'light' }"
        >
          <i class="icon-sun"></i>
        </button>
        <button
          class="radio__item"
          @click="switchThemeDark()"
          :class="{ current: store.state.config.themeLabel === 'dark' }"
        >
          <i class="icon-moon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import ArtistList from "../../components/ArtistList.vue";
import Cover from "../Cover.vue";
import { Mutations } from "./ConfigStore";

export default defineComponent({
  components: { ArtistList, Cover },
  setup() {
    const store = useStore<RootState>();

    function switchThemeLight() {
      store.commit(`config/${Mutations.SWITCH_THEME_LIGHT}`);
    }

    function switchThemeDark() {
      store.commit(`config/${Mutations.SWITCH_THEME_DARK}`);
    }

    function schemeBlue() {
      store.commit(`config/${Mutations.SCHEME_BLUE}`);
    }

    function schemeDefault() {
      store.commit(`config/${Mutations.SCHEME_DEFAULT}`);
    }

    function schemeCrimson() {
      store.commit(`config/${Mutations.SCHEME_CRIMSON}`);
    }

    function schemeApple() {
      store.commit(`config/${Mutations.SCHEME_APPLE}`);
    }

    return { store, switchThemeLight, switchThemeDark, schemeBlue, schemeDefault, schemeCrimson, schemeApple };
  }
});
</script>

<style lang="scss" scoped>
@keyframes popConfig {
  from {
    opacity: 0;
    transform: scale(0);
    transform-origin: top right;
  }
}

.schemes {
  display: flex;
  justify-content: space-evenly;
  margin-top: 15px;

  &__item {
    $s: 15px;
    width: $s * 2;
    height: $s;
    border-radius: $s;
    padding: 0;
    border: 0;
    cursor: pointer;
    position: relative;

    &::after {
      $o: 3px;
      position: absolute;
      top: $o;
      bottom: $o;
      left: $o;
      right: $o;
      content: "";
      background-color: var(--bg-color-darker);
      border-radius: $s;
    }

    &.current {
      &::after {
        display: none;
      }
    }
    &.blue {
      background-color: #15acde;
    }
    &.default {
      background-color: #6d49c9;
    }
    &.crimson {
      background-color: #de1c3e;
    }
    &.apple {
      background-color: #28aa1b;
    }
  }
}

.links {
  &__item {
    width: 100%;
    display: block;
  }
}

.user {
  margin-bottom: 20px;

  &__mail {
    margin-top: 2px;
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.5;
  }
}
.config {
  animation: popConfig ease 0.2s both;
  background-color: var(--bg-color-darker);
  padding: 20px;
  position: absolute;
  top: calc(100% - 3px);
  right: 20px;
  border-radius: 4px;
  width: 250px;
  box-shadow: 0 5px 10px rgba(black, 0.2);
  z-index: 999;
}

.radio {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;

  &__item {
    $radius: 4px;
    width: 100%;
    margin-top: 10px;
    padding: 7px 0;
    border: 0;
    background-color: var(--bg-color);
    cursor: pointer;
    color: currentColor;

    &:first-of-type {
      border-radius: $radius 0 0 $radius;
    }

    &:last-of-type {
      border-radius: 0 $radius $radius 0;
    }

    &.current {
      background-color: var(--primary-color);
      color: white;
    }
  }
}
</style>
