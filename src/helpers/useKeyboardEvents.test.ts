import { describe, expect, it } from "vitest";

import { ownsSpaceKey } from "./useKeyboardEvents";

function el(html: string): Element {
  document.body.innerHTML = html;
  return document.body.querySelector("[data-target]")!;
}

describe("ownsSpaceKey", () => {
  it("leaves space to the player on body and non-interactive focus targets", () => {
    expect(ownsSpaceKey(document.body)).toBe(false);
    expect(ownsSpaceKey(el("<main tabindex=\"-1\" data-target></main>"))).toBe(false);
    expect(ownsSpaceKey(el("<a href=\"/album\" data-target>Album</a>"))).toBe(false);
  });

  it("keeps space for fields and controls", () => {
    expect(ownsSpaceKey(el("<input data-target />"))).toBe(true);
    expect(ownsSpaceKey(el("<textarea data-target></textarea>"))).toBe(true);
    expect(ownsSpaceKey(el("<button data-target></button>"))).toBe(true);
    expect(ownsSpaceKey(el("<div role=\"slider\" data-target></div>"))).toBe(true);
    expect(ownsSpaceKey(el("<div contenteditable=\"true\" data-target></div>"))).toBe(true);
  });

  it("keeps space for elements nested in a control", () => {
    expect(ownsSpaceKey(el("<button><span data-target></span></button>"))).toBe(true);
  });

  it("ignores non-element targets", () => {
    expect(ownsSpaceKey(null)).toBe(false);
    expect(ownsSpaceKey(window)).toBe(false);
  });
});
