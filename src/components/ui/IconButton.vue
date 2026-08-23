<template>
  <button :aria-label="label" :aria-pressed="pressed" :title="label" type="button">
    <i :class="`icon-${icon}`" aria-hidden="true" />
  </button>
</template>

<script lang="ts" setup>
/*
 * Every icon-only control in the app goes through here, because writing the
 * button by hand is exactly how seventeen of them ended up announcing
 * themselves as "button" and nothing else. `label` is required, so the next one
 * can't repeat that: there is no way to render this component without a name.
 *
 * `aria-hidden` on the glyph matters as much as the label — the icons are an
 * icomoon webfont, so without it a screen reader reads out the private-use
 * codepoint sitting behind `.icon-play`.
 *
 * `pressed` is only for real toggles (shuffle, repeat, mute). Left undefined,
 * Vue drops the attribute entirely, which is what a plain action button wants.
 */
defineProps<{
  icon: string;
  label: string;
  pressed?: boolean;
}>();
</script>

<style scoped>
button {
  align-items: center;
  background-color: transparent;
  border: 0;
  color: currentcolor;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
}

/*
 * Touch targets are physical, so this is the one place px beats rem: 44px is
 * 44px whatever the reader set their font size to. Scoped to coarse pointers
 * so the compact desktop density the product is built on stays untouched.
 */
@media (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
