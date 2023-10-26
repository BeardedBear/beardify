import { createRouter, createWebHistory, LocationQueryValue, RouteLocation, RouteRecordRaw } from "vue-router";

import AlbumPage from "./views/album/AlbumPage.vue";
import ArtistPage from "./views/artist/ArtistPage.vue";
import AuthPage from "./views/auth/AuthPage.vue";
import HomePage from "./views/home/HomePage.vue";
import LoginPage from "./views/LoginPage.vue";
import CollectionPage from "./views/playlist/CollectionPage.vue";
import PlaylistPage from "./views/playlist/PlaylistPage.vue";
import PodcastListPage from "./views/podcasts/PodcastListPage.vue";
import PodcastPage from "./views/podcasts/PodcastPage.vue";
import ReleaseListPage from "./views/releases/ReleaseListPage.vue";
import UserPage from "./views/user/UserPage.vue";

export enum RouteName {
  About = "/about/",
  Album = "/album/",
  Artist = "/artist/",
  Auth = "/auth/",
  Collection = "/collection/",
  Home = "/",
  Login = "/login/",
  Playlist = "/playlist/",
  Podcasts = "/podcasts/",
  Releases = "/releases/",
  User = "/user/",
}

const routes: Array<RouteRecordRaw> = [
  {
    component: HomePage,
    name: "Home",
    path: RouteName.Home,
  },
  {
    component: LoginPage,
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
    component: AuthPage,
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
