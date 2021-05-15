<template>
  <div class="colors">
    <div class="schemes">
      <button
        v-for="(c, index) in textColors"
        :key="index"
        class="schemes__item"
        :class="{
          current: store.state.config.schemeLabel === `${c.name}`,
          crimson: c.name === 'crimson',
          blue: c.name === 'blue',
          apple: c.name === 'apple',
          default: c.name === 'default',
        }"
        @click="c.fn()"
      />
    </div>

    <div>
      <div class="radio">
        <button
          class="radio__item"
          :class="{ current: store.state.config.themeLabel === 'light' }"
          @click="switchThemeLight()"
        >
          <i class="icon-sun" />
        </button>
        <button
          class="radio__item"
          :class="{ current: store.state.config.themeLabel === 'dark' }"
          @click="switchThemeDark()"
        >
          <i class="icon-moon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { Mutations } from "./ConfigStore";

interface TextColors {
  name: string;
  fn: () => void;
}

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    const textColors: TextColors[] = [
      {
        name: "default",
        fn: () => store.commit(`config/${Mutations.SCHEME_DEFAULT}`),
      },
      {
        name: "blue",
        fn: () => store.commit(`config/${Mutations.SCHEME_BLUE}`),
      },
      {
        name: "crimson",
        fn: () => store.commit(`config/${Mutations.SCHEME_CRIMSON}`),
      },
      {
        name: "apple",
        fn: () => store.commit(`config/${Mutations.SCHEME_APPLE}`),
      },
    ];

    function switchThemeLight() {
      store.commit(`config/${Mutations.SWITCH_THEME_LIGHT}`);
    }

    function switchThemeDark() {
      store.commit(`config/${Mutations.SWITCH_THEME_DARK}`);
    }

    return {
      store,
      textColors,
      switchThemeLight,
      switchThemeDark,
    };
  },
});
</script>

<style lang="scss" scoped>
.schemes {
  display: flex;
  justify-content: space-evenly;

  &__item {
    $s: 15px;
    height: $s;
    padding: 0;
    border: 0;
    cursor: pointer;
    position: relative;
    flex: 1;
    transition: all ease 0.2s;

    // &:hover {
    //   opacity: 0.8;
    // }

    &:first-of-type {
      border-radius: $s 0 0 $s;
    }

    &:last-of-type {
      border-radius: 0 $s $s 0;
    }

    &::after {
      $o: 6px;
      position: absolute;
      top: $o;
      bottom: $o;
      left: $o * 2;
      right: $o * 2;
      content: "";
      background-color: white;
      border-radius: $s;
      transition: all ease 0.2s;
      transform: scaleX(0);
      will-change: transform;
    }

    &.current {
      &::after {
        transform: scaleX(1);
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
