import { createRouter, createWebHistory, LocationQueryValue, RouteLocation, RouteRecordRaw } from "vue-router";
import About from "./views/AboutPage.vue";
import Album from "./views/album/Album.vue";
import Artist from "./views/artist/Artist.vue";
import Auth from "./views/auth/Auth.vue";
import Home from "./views/home/Home.vue";
import Login from "./views/Login.vue";
import Collection from "./views/playlist/Collection.vue";
import Playlist from "./views/playlist/Playlist.vue";
import PodcastListPage from "./views/podcasts/PodcastListPage.vue";
import PodcastPage from "./views/podcasts/PodcastPage.vue";

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
}

const routes: Array<RouteRecordRaw> = [
  {
    path: RouteName.Home,
    name: "Home",
    component: Home,
  },
  {
    path: RouteName.About,
    name: "About",
    component: About,
  },
  {
    path: RouteName.Login,
    name: "Login",
    component: Login,
  },
  {
    component: Artist,
    name: "Artist",
    path: RouteName.Artist + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    component: Album,
    name: "Album",
    path: RouteName.Album + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    component: Playlist,
    name: "Playlist",
    path: RouteName.Playlist + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    component: Collection,
    name: "Collection",
    path: RouteName.Collection + ":id",
    props: (route: RouteLocation): Record<string, string | string[]> => ({ id: route.params.id }),
  },
  {
    path: RouteName.Auth,
    name: "Auth",
    component: Auth,
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
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

export default router;
