import { createRouter, createWebHistory, LocationQueryValue, RouteLocation, RouteRecordRaw } from "vue-router";

import { isTauri } from "@/helpers/platform";

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
    component: (): Promise<unknown> => import("@/views/home/HomePage.vue"),
    name: "Home",
    path: RouteName.Home,
  },
  {
    component: (): Promise<unknown> => import("@/views/LoginPage.vue"),
    meta: { chromeless: true },
    name: "Login",
    path: RouteName.Login,
  },
  {
    component: (): Promise<unknown> => import("@/views/artist/ArtistPage.vue"),
    name: "Artist",
    path: `${RouteName.Artist}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/album/AlbumPage.vue"),
    name: "Album",
    path: `${RouteName.Album}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/playlist/PlaylistPage.vue"),
    name: "Playlist",
    path: `${RouteName.Playlist}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/playlist/CollectionPage.vue"),
    name: "Collection",
    path: `${RouteName.Collection}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/playlist/SharedCollectionPage.vue"),
    meta: { chromeless: true, skipBootAuth: true },
    name: "Share",
    path: `${RouteName.Share}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/genre/GenrePage.vue"),
    name: "Genre",
    path: `${RouteName.Genre}:name`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      name: route.params.name,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/auth/AuthPage.vue"),
    meta: { skipBootAuth: true },
    name: "Auth",
    path: RouteName.Auth,
    props: (route: RouteLocation): Record<string, LocationQueryValue | LocationQueryValue[]> => ({
      query: route.query.code,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/podcasts/PodcastListPage.vue"),
    name: "PodcastList",
    path: RouteName.Podcasts,
  },
  {
    component: (): Promise<unknown> => import("@/views/podcasts/PodcastPage.vue"),
    name: "Podcast",
    path: `${RouteName.Podcasts}:id`,
    props: (route: RouteLocation): Record<string, string | string[]> => ({
      id: route.params.id,
    }),
  },
  {
    component: (): Promise<unknown> => import("@/views/releases/ReleaseListPage.vue"),
    name: "Releases",
    path: RouteName.Releases,
  },
  {
    component: (): Promise<unknown> => import("@/views/user/UserPage.vue"),
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
