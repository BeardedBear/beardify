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

export interface ReleasesPage {
  menu: MenuItem[];
  releases: Release[];
  monthList: string[];
  activeSlug: string | null;
}
