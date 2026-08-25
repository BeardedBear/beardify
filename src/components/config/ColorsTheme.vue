<template>
  <div class="colors">
    <div class="schemes">
      <ButtonIndex
        v-for="(c, index) in textColors"
        :key="index"
        no-default-class
        :class="{
          current: configStore.schemeLabel === `${c.name}`,
          crimson: c.name === 'crimson',
          blue: c.name === 'blue',
          apple: c.name === 'apple',
          default: c.name === 'default',
        }"
        class="scheme-item"
        @click="c.fn()"
      />
    </div>

    <div>
      <div class="radio">
        <ButtonIndex
          no-default-class
          :class="{ current: configStore.themeLabel === 'light' }"
          class="radio-item squircle"
          @click="configStore.switchTheme('light')"
        >
          <i class="icon-sun" />
        </ButtonIndex>
        <ButtonIndex
          no-default-class
          :class="{ current: configStore.themeLabel === 'dark' }"
          class="radio-item squircle"
          @click="configStore.switchTheme('dark')"
        >
          <i class="icon-moon" />
        </ButtonIndex>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useConfig } from "@/components/config/ConfigStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";

const configStore = useConfig();

interface TextColors {
  fn: () => void;
  name: string;
}

const textColors: TextColors[] = [
  {
    fn: (): void => configStore.switchScheme("default"),
    name: "default",
  },
  {
    fn: (): void => configStore.switchScheme("blue"),
    name: "blue",
  },
  {
    fn: (): void => configStore.switchScheme("crimson"),
    name: "crimson",
  },
  {
    fn: (): void => configStore.switchScheme("apple"),
    name: "apple",
  },
];
</script>

<style scoped>

.schemes {
  display: flex;
  justify-content: space-evenly;
}

.scheme-item {
  --scheme-size: 1rem;

  border: 0;
  cursor: pointer;
  flex: 1;
  height: var(--scheme-size);
  padding: 0;
  position: relative;
  transition: all ease 0.2s;

  &:first-of-type {
    border-radius: var(--scheme-size) 0 0 var(--scheme-size);
  }

  &:last-of-type {
    border-radius: 0 var(--scheme-size) var(--scheme-size) 0;
  }

  &::after {
    --inset-offset: 0.3rem;

    background-color: white;
    border-radius: var(--scheme-size);
    content: "";
    inset: var(--inset-offset) calc(var(--inset-offset) * 2) var(--inset-offset) calc(var(--inset-offset) * 2);
    position: absolute;
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
    background-color: #9064ff;
  }

  &.crimson {
    background-color: #de1c3e;
  }

  &.apple {
    background-color: #28aa1b;
  }
}

.radio {
  display: flex;
  justify-content: space-between;
}

.radio-item {
  --radio-radius: 1rem;

  background-color: var(--bg-color);
  border: 0;
  color: currentcolor;
  cursor: pointer;
  margin-top: 0.8rem;
  padding: 0.5rem 0;
  width: 100%;

  &:first-of-type {
    border-radius: var(--radio-radius) 0 0 var(--radio-radius);
  }

  &:last-of-type {
    border-radius: 0 var(--radio-radius) var(--radio-radius) 0;
  }

  &.current {
    background-color: var(--primary-color);
    color: white;
  }
}
</style>
