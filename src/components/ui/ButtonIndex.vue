<script setup lang="ts">
import { computed } from "vue";
import { type RouteLocationRaw, RouterLink } from "vue-router";

export interface ButtonProps {
  align?: "left" | "center" | "right" | "justify";
  as?: "button" | "a" | "router-link";
  class?: string;
  disabled?: boolean;
  href?: string;
  iconOnly?: boolean;
  noDefaultClass?: boolean;
  size?: "big" | "default" | "small" | "x-small";
  target?: "_blank" | "_self" | "_parent" | "_top";
  to?: RouteLocationRaw;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "primary" | "nude" | "full" | "border";
}

const props = withDefaults(defineProps<ButtonProps>(), {
  align: "center",
  as: "button",
  disabled: false,
  iconOnly: false,
  noDefaultClass: false,
  size: "default",
  target: "_self",
  type: "button",
  variant: "default",
});

const componentTag = computed(() => {
  if (props.as === "router-link" || props.to) {
    return RouterLink;
  }
  if (props.as === "a" || props.href) {
    return "a";
  }
  return "button";
});

const componentProps = computed(() => {
  const baseProps: Record<string, unknown> = {};

  if (componentTag.value === RouterLink) {
    baseProps.to = props.to;
  } else if (componentTag.value === "a") {
    baseProps.href = props.href;
    baseProps.target = props.target;
  } else {
    baseProps.type = props.type;
    baseProps.disabled = props.disabled;
  }

  return baseProps;
});

const classes = computed(() => {
  const classList: string[] = [];

  // Add default 'button' class unless noDefaultClass is true
  if (!props.noDefaultClass) {
    classList.push("button");
  }

  // Add variant classes
  if (props.variant === "primary") {
    classList.push("button-primary");
  } else if (props.variant === "nude") {
    classList.push("button-nude");
  } else if (props.variant === "full") {
    classList.push("button-full");
  } else if (props.variant === "border") {
    classList.push("button-with-border");
  }

  // Add size classes
  if (props.size === "small") {
    classList.push("button-small");
  } else if (props.size === "big") {
    classList.push("button-big");
  } else if (props.size === "x-small") {
    classList.push("button-x-small");
  }

  // Add alignment classes
  if (props.align === "left") {
    classList.push("button-align-left");
  } else if (props.align === "right") {
    classList.push("button-align-right");
  } else if (props.align === "justify") {
    classList.push("button-align-justify");
  } else {
    classList.push("button-align-center");
  }

  // Add icon-only class
  if (props.iconOnly) {
    classList.push("button-icon-only");
  }

  // Add custom classes
  if (props.class) {
    classList.push(props.class);
  }

  return classList.join(" ");
});
</script>

<template>
  <component :is="componentTag" :class="classes" v-bind="componentProps">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use "@/assets/scss/mixins" as *;

.button {
  @include squircle;

  align-items: center;
  appearance: none;
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 1rem;
  color: var(--font-color-dark);
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-weight: 700;
  gap: 8px;
  justify-content: center;
  line-height: 1;
  padding: 0.6rem 1rem;
  text-align: center;
  text-decoration: none;
  white-space: pre;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    background-color: var(--bg-color-lighter);
    color: var(--font-color-light);
  }

  &:active:not(:disabled) {
    background-color: var(--bg-color-lighter);
  }

  &-primary {
    background-color: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--primary-color-light);
      color: white;
    }

    &:active:not(:disabled) {
      background-color: var(--primary-color-lighter);
      color: white;
    }
  }

  &-nude {
    background-color: transparent;
    border: 0;
    color: var(--font-color);
    cursor: pointer;
    opacity: 0.5;
    padding: 0.5rem 0.6rem;

    &:hover:not(:disabled) {
      background-color: transparent;
      opacity: 1;
    }
  }

  &-big {
    font-size: 1rem;
    padding: 0.75rem 1.2rem;
  }

  &-small {
    font-size: 0.9rem;
    padding: 0.5rem 0.6rem;
  }

  &-x-small {
    font-size: 0.8rem;
    padding: 0.1rem 0.5rem;
  }

  &-icon-only {
    &.button-small {
      padding: 0.5rem 0.6rem;
    }

    &.button-x-small {
      padding: 0.25rem 0.5rem;
    }
  }

  &-full {
    text-align: left;
    width: 100%;
  }

  &-with-border {
    border: 1px solid var(--bg-color-lighter);
  }

  &-align-left {
    place-content: flex-start;
  }

  &-align-center {
    place-content: center;
  }

  &-align-right {
    place-content: right;
  }

  &-align-justify {
    display: flex;
    place-content: space-between;
  }
}
</style>
