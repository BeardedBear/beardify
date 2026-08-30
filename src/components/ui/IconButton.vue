<template>
  <BdTooltip :content="label">
    <button :aria-label="label" :aria-pressed="pressed" type="button">
      <i :class="`icon-${icon}`" aria-hidden="true" />
    </button>
  </BdTooltip>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";

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
 *
 * The tooltip is the root on purpose, and not `bare`: call sites style this
 * component's outer box (`position: absolute`, padding, `display: none` under a
 * media query), and Vue hands a child component's root BOTH the class and the
 * parent's scoped-style attribute. Split them — class forwarded to the button
 * through `$attrs`, scope id left on the root — and every one of those rules
 * stops matching.
 */
defineProps<{
  icon: string;
  label?: string;
  pressed?: boolean;
}>();
</script>

<style scoped>
/*
 * The tooltip trigger is this component's root, so a call site's class sizes,
 * pads and positions that span — the button only fills it. Hence the 100%: a
 * <span> hands out none of the centring a <button> gets for free from the UA
 * stylesheet, so a sized call site (the 2.5rem round play button on an album
 * card) would drop its glyph in the top-left corner.
 */
button {
  align-items: center;
  background-color: transparent;
  block-size: 100%;
  border: 0;
  color: currentcolor;
  cursor: pointer;
  display: inline-flex;
  inline-size: 100%;
  justify-content: center;

  /*
   * The UA's own button padding, dropped. A call site pads the trigger span —
   * `.options .icon` in the sidebar, for one — because that span is now this
   * component's root; the UA's ~1px 6px then stacked underneath it and made
   * every icon wider than the call site asked for. Three of them in the
   * collections header was enough to overflow the row and wrap it into a
   * column.
   */
  padding: 0;
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
