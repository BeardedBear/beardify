import { Coords } from "@/@types/Setlistfm";
import { SearchCategories } from "@/components/search/searchCategories";

export interface Config {
  /** Country filter of the artist concerts tab, ISO alpha-2; empty means every country */
  concertCountry: string;
  /** Where "near me" is measured from; set from the browser geolocation, on demand */
  /** Country of `homeLocation`, ISO alpha-2; empty until detected */
  homeCountry: string;
  homeLocation: Coords | null;
  /** How far a show still counts as "near you" */
  nearRadiusKm: number;
  /** "Near you" means anywhere in `homeCountry`, the radius is ignored */
  nearWholeCountry: boolean;
  /** Which columns the search modal looks in. Off means neither fetched nor shown. */
  searchCategories: SearchCategories;
  show: boolean;
  tierListSideLabels: boolean;
  /** Preferred Wikipedia edition for artist biographies; empty means "not chosen yet" */
  wikipediaLanguage: string;
}
