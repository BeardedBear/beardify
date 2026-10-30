import { describe, expect, it } from "vitest";

import { Device } from "@/@types/Device";

import { shouldReclaimLocalDevice } from "./player";

const device = (id: string, is_active = false): Device => ({
  id,
  is_active,
  is_private_session: false,
  is_restricted: false,
  name: id,
  type: "computer",
  volume_percent: 50,
});

/*
 * After a long idle or a sleep the SDK re-registers under a new id. The store
 * must follow this browser to that id, or it keeps tracking a ghost device,
 * treats playback as external and mutes the SDK's own state. It must never do
 * the same for an external speaker that briefly drops off the list.
 */
describe("shouldReclaimLocalDevice", () => {
  const local = new Set(["new-local", "old-local"]);

  it("follows this browser to its new id once the old one is gone", () => {
    expect(shouldReclaimLocalDevice([device("new-local")], "old-local", "new-local", local)).toBe(true);
  });

  it("leaves a vanished external speaker alone", () => {
    expect(shouldReclaimLocalDevice([device("new-local")], "soundbar", "new-local", local)).toBe(false);
  });

  it("defers to a device Spotify reports as active", () => {
    expect(shouldReclaimLocalDevice([device("new-local"), device("phone", true)], "old-local", "new-local", local))
      .toBe(false);
  });

  it("keeps a tracked local device that is still listed", () => {
    expect(shouldReclaimLocalDevice([device("new-local")], "new-local", "new-local", local)).toBe(false);
  });

  it("does nothing before the SDK has registered or with nothing tracked", () => {
    expect(shouldReclaimLocalDevice([], "old-local", "", local)).toBe(false);
    expect(shouldReclaimLocalDevice([], "", "new-local", local)).toBe(false);
    expect(shouldReclaimLocalDevice([], null, "new-local", local)).toBe(false);
  });
});
