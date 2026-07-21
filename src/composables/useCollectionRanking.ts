import { computed, ComputedRef, Ref } from "vue";

import { AlbumSimplified } from "@/@types/Album";
import { buildRankIndex, CollectionRankingMode, parseCollectionRankingMode, TierList, TopTiers } from "@/helpers/collectionOptions";

export interface CollectionRanking {
  rankingMode: ComputedRef<CollectionRankingMode>;
  rankOf: (id: string) => number;
  tierList: ComputedRef<null | TierList>;
  topTiers: ComputedRef<null | TopTiers>;
}

/**
 * Derives the ranking mode (Top / Tier list / off) and per-album rank from a
 * playlist description and its current album order. Shared by CollectionPage
 * and SharedCollectionPage — this half is pure/read-only in both; the actual
 * tier groupings stay page-local since CollectionPage needs them as mutable
 * refs (drag v-model targets) while SharedCollectionPage only ever reads them.
 */
export function useCollectionRanking(description: Ref<string>, albumList: Ref<AlbumSimplified[]>): CollectionRanking {
  const rankingMode = computed(() => parseCollectionRankingMode(description.value));
  const topTiers = computed<null | TopTiers>(() => (rankingMode.value.type === "top" ? rankingMode.value.tiers : null));
  const tierList = computed<null | TierList>(() =>
    rankingMode.value.type === "tierlist" ? rankingMode.value.tiers : null,
  );
  const rankIndex = computed(() => buildRankIndex(albumList.value));

  function rankOf(id: string): number {
    return (rankIndex.value.get(id) ?? -1) + 1;
  }

  return { rankingMode, rankOf, tierList, topTiers };
}
