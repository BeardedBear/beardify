<template>
  <div class="config">
    <div>Theme</div>
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

    return { store, switchThemeLight, switchThemeDark };
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
.config {
  animation: popConfig ease 0.2s both;
  background-color: var(--bg-color-darker);
  padding: 20px;
  position: absolute;
  top: calc(100% - 3px);
  right: 20px;
  border-radius: 4px;
  width: 200px;
  box-shadow: 0 5px 10px rgba(black, 0.2);
  z-index: 999;
}

.radio {
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
