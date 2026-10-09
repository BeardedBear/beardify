/*
 * Spotify pulled the generic `/browse/categories` endpoint from Extended Quota
 * Mode apps (Nov 2024) — this app has never called it (grep the codebase: zero
 * hits), and GenreStore already works around the same gap for artists by
 * querying `search` instead of browsing real category metadata. This list is
 * the same workaround for shows: a fixed taxonomy, each entry a keyword handed
 * to `search?type=show`, not a category Spotify itself returns.
 */
export interface PodcastCategory {
  icon: string;
  id: string;
  label: string;
  query: string;
}

export const PODCAST_CATEGORIES: PodcastCategory[] = [
  { icon: "Siren", id: "true-crime", label: "True Crime", query: "true crime" },
  { icon: "Drama", id: "comedy", label: "Comedy", query: "comedy" },
  { icon: "Newspaper", id: "news", label: "News & Politics", query: "news" },
  { icon: "Briefcase", id: "business", label: "Business", query: "business" },
  { icon: "Cpu", id: "technology", label: "Technology", query: "technology" },
  { icon: "HeartPulse", id: "health", label: "Health & Fitness", query: "health" },
  { icon: "Trophy", id: "sports", label: "Sports", query: "sports" },
  { icon: "Music", id: "music", label: "Music", query: "music" },
  { icon: "Palette", id: "arts", label: "Arts", query: "arts" },
  { icon: "FlaskConical", id: "science", label: "Science", query: "science" },
  { icon: "Landmark", id: "history", label: "History", query: "history" },
  { icon: "GraduationCap", id: "education", label: "Education", query: "education" },
  { icon: "Globe", id: "society-culture", label: "Society & Culture", query: "society and culture" },
  { icon: "BookOpen", id: "fiction", label: "Fiction", query: "fiction" },
];
