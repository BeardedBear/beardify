import { createRouter, createWebHistory, LocationQueryValue, RouteLocation, RouteRecordRaw } from "vue-router";

import { isTauri } from "@/helpers/platform";
import AlbumPage from "@/views/album/AlbumPage.vue";
import ArtistPage from "@/views/artist/ArtistPage.vue";
import AuthPage from "@/views/auth/AuthPage.vue";
import GenrePage from "@/views/genre/GenrePage.vue";
import HomePage from "@/views/home/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import CollectionPage from "@/views/playlist/CollectionPage.vue";
import PlaylistPage from "@/views/playlist/PlaylistPage.vue";
import SharedCollectionPage from "@/views/playlist/SharedCollectionPage.vue";
import PodcastListPage from "@/views/podcasts/PodcastListPage.vue";
import PodcastPage from "@/views/podcasts/PodcastPage.vue";
import ReleaseListPage from "@/views/releases/ReleaseListPage.vue";
import UserPage from "@/views/user/UserPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    // No Sidebar/Player/DialogList shell — just the route's own component.
    chromeless?: boolean;
    // Skip the boot-time token refresh attempt (and its login redirect on failure) in main.ts.
    skipBootAuth?: boolean;
  }
}

export enum RouteName {
  Album = "/album/",
  Artist = "/artist/",
  Auth = "/auth/",
  Collection = "/collection/",
  Genre = "/genre/",
  Home = "/",
  Login = "/login/",
  Playlist = "/playlist/",
  Podcasts = "/podcasts/",
  Releases = "/releases/",
  Share = "/share/",
  User = "/user/",
}

// The Tauri desktop app's webview runs on an internal `tauri://`/`http://tauri.localhost`
// origin, which is meaningless to whoever opens a shared link — fall back to the real
// web domain there instead of `window.location.origin`.
const PROD_APP_URL = "https://beardify.netlify.app";

/**
 * Builds an absolute, shareable URL for a route that takes an id (e.g. Collection, Share).
 */
export function absoluteRouteUrl(routeName: RouteName, id: string): string {
  const origin = isTauri() ? PROD_APP_URL : window.location.origin;
  return `${origin}${routeName}${id}`;
}

const routes: Array<RouteRecordRaw> = [
  {
    component: HomePage,
    name: "Home",
    path: RouteName.Home,
  },
  {
    component: LoginPage,
    meta: { chromeless: true },
    name: "Login",
    path: RouteName.Login,
  },
  {
    component: ArtistPage,
    name: "Artist",
    path: `${RouteName.Artist}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: AlbumPage,
    name: "Album",
    path: `${RouteName.Album}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: PlaylistPage,
    name: "Playlist",
    path: `${RouteName.Playlist}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: CollectionPage,
    name: "Collection",
    path: `${RouteName.Collection}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: SharedCollectionPage,
    meta: { chromeless: true, skipBootAuth: true },
    name: "Share",
    path: `${RouteName.Share}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: GenrePage,
    name: "Genre",
    path: `${RouteName.Genre}:name`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      name: route.params.name,
    }),
  },
  {
    component: AuthPage,
    meta: { skipBootAuth: true },
    name: "Auth",
    path: RouteName.Auth,
    props: (route: RouteLocation): Record<string, LocationQueryValue | LocationQueryValue[]> => ({
      query: route.query.code,
    }),
  },
  {
    component: PodcastListPage,
    name: "PodcastList",
    path: RouteName.Podcasts,
  },
  {
    component: PodcastPage,
    name: "Podcast",
    path: `${RouteName.Podcasts}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: ReleaseListPage,
    name: "Releases",
    path: RouteName.Releases,
  },
  {
    component: UserPage,
    name: "User",
    path: `${RouteName.User}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

export default router;
