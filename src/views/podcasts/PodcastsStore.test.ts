import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { Episode } from "@/@types/Podcast";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

function episode(resumePoint: Episode["resume_point"]): Episode {
  return { resume_point: resumePoint } as Episode;
}

describe("listenedCount", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("counts only fully played episodes", () => {
    const store = usePodcasts();
    store.episodes = [
      episode({ fully_played: true, resume_position_ms: 0 }),
      episode({ fully_played: false, resume_position_ms: 120000 }),
      episode({ fully_played: true, resume_position_ms: 0 }),
    ];

    expect(store.listenedCount).toBe(2);
  });

  /*
   * `resume_point` is null for a show the account has never opened, which is
   * the shape that turns a denominator into a crash rather than a zero.
   */
  it("treats a missing resume point as unlistened", () => {
    const store = usePodcasts();
    store.episodes = [episode(null), episode(null)];

    expect(store.listenedCount).toBe(0);
  });
});
