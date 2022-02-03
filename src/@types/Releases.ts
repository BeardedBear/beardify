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
  id: string;
  createdAt: number;
}

export interface ReleasesPage {
  menu: MenuItem[];
  releases: Release[];
  monthList: string[];
  activeSlug: string | null;
  checks: Check[] | null;
  uid: number | null;
}
