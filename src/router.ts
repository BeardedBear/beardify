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

export enum RouteName {
  Home = "/",
  Login = "/login/",
  About = "/about/",
  Auth = "/auth/",
  Artist = "/artist/",
  Collection = "/collection/",
  Album = "/album/",
  Playlist = "/playlist/",
  Podcasts = "/podcasts/",
  Releases = "/releases/",
}

const routes: Array<RouteRecordRaw> = [
  {
    path: RouteName.Home,
    name: "Home",
    component: HomePage,
  },
  {
    path: RouteName.Login,
    name: "Login",
    component: LoginPage,
  },
  {
    component: ArtistPage,
    name: "Artist",
    path: RouteName.Artist + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    component: AlbumPage,
    name: "Album",
    path: RouteName.Album + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    component: PlaylistPage,
    name: "Playlist",
    path: RouteName.Playlist + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    component: CollectionPage,
    name: "Collection",
    path: RouteName.Collection + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    path: RouteName.Auth,
    name: "Auth",
    component: AuthPage,
    props: (route: RouteLocation): Record<string, LocationQueryValue | LocationQueryValue[]> => ({
      query: route.query.code,
    }),
  },
  {
    path: RouteName.Podcasts,
    name: "PodcastList",
    component: PodcastListPage,
  },
  {
    path: RouteName.Podcasts + ":id",
    name: "Podcast",
    component: PodcastPage,
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    path: RouteName.Releases,
    name: "Releases",
    component: ReleaseListPage,
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
