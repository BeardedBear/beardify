import { SearchCategories } from "@/components/search/searchCategories";

export interface Config {
  /** Which columns the search modal looks in. Off means neither fetched nor shown. */
  searchCategories: SearchCategories;
  show: boolean;
  tierListSideLabels: boolean;
  /** Preferred Wikipedia edition for artist biographies; empty means "not chosen yet" */
  wikipediaLanguage: string;
}
