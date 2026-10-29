import { Coords } from "@/@types/Setlistfm";
import { SearchCategories } from "@/components/search/searchCategories";

export interface Config {
  /** Country filter of the artist concerts tab, ISO alpha-2; empty means every country */
  concertCountry: string;
  /** Where "near me" is measured from; set from the browser geolocation, on demand */
  homeLocation: Coords | null;
  /** Which columns the search modal looks in. Off means neither fetched nor shown. */
  searchCategories: SearchCategories;
  show: boolean;
  tierListSideLabels: boolean;
  /** Preferred Wikipedia edition for artist biographies; empty means "not chosen yet" */
  wikipediaLanguage: string;
}
