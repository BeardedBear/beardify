<template>
  <div class="colors">
    <div class="schemes">
      <button
        v-for="(c, index) in textColors"
        :key="index"
        class="schemes__item"
        :class="{
          current: configStore.schemeLabel === `${c.name}`,
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
          :class="{ current: configStore.themeLabel === 'light' }"
          @click="configStore.switchTheme('light')"
        >
          <i class="icon-sun" />
        </button>
        <button
          class="radio__item"
          :class="{ current: configStore.themeLabel === 'dark' }"
          @click="configStore.switchTheme('dark')"
        >
          <i class="icon-moon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useConfig } from "./ConfigStore";

const configStore = useConfig();

interface TextColors {
  name: string;
  fn: () => void;
}

const textColors: TextColors[] = [
  {
    name: "default",
    fn: (): void => configStore.switchScheme("default"),
  },
  {
    name: "blue",
    fn: (): void => configStore.switchScheme("blue"),
  },
  {
    name: "crimson",
    fn: (): void => configStore.switchScheme("crimson"),
  },
  {
    name: "apple",
    fn: (): void => configStore.switchScheme("apple"),
  },
];
</script>

<style lang="scss" scoped>
.schemes {
  display: flex;
  justify-content: space-evenly;

  &__item {
    $s: 15px;
    border: 0;
    cursor: pointer;
    flex: 1;
    height: $s;
    padding: 0;
    position: relative;
    transition: all ease 0.2s;

    &:first-of-type {
      border-radius: $s 0 0 $s;
    }

    &:last-of-type {
      border-radius: 0 $s $s 0;
    }

    &::after {
      $o: 6px;
      background-color: white;
      border-radius: $s;
      bottom: $o;
      content: "";
      left: $o * 2;
      position: absolute;
      right: $o * 2;
      top: $o;
      transform: scaleX(0);
      transition: all ease 0.2s;
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
    background-color: var(--bg-color);
    border: 0;
    color: currentColor;
    cursor: pointer;
    margin-top: 10px;
    padding: 7px 0;
    width: 100%;

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
