/** A point on the map, in degrees. */
export interface Coords {
  lat: number;
  lon: number;
}

export interface Setlist {
  /** "dd-MM-yyyy", not ISO */
  eventDate: string;
  id: string;
  sets: { set: { encore?: number; name?: string; song: { name: string; tape?: boolean }[] }[] };
  tour?: { name: string };
  url: string;
  venue: {
    city?: {
      coords?: { lat: number; long: number };
      country?: { code: string; name: string };
      name: string;
      state?: string;
    };
    name: string;
  };
}

export interface SetlistPage {
  itemsPerPage: number;
  page: number;
  setlist?: Setlist[];
  total: number;
}
