export interface Release {
  album: string;
  artist: string;
  category: string;
  id: string;
  note: number;
  releaseDate: string;
  releaseDateRaw: number;
  slug: string[];
}

export interface MenuItem {
  name: string;
  slugs: string[];
}

export interface ReleasesCheck {
  checks: Check[];
  id: number;
  user: string;
}

export interface Check {
  createdAt: number;
  id: string;
}

export interface ReleasesPage {
  activeSlug: null | string;
  checks: Check[] | null;
  menu: MenuItem[];
  monthList: string[];
  releases: Release[];
  uid: null | number;
}
