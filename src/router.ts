import { createRouter, createWebHistory, RouteLocation, RouteRecordRaw } from "vue-router";
import store from "./store";
import About from "./views/About.vue";
import Album from "./views/album/Album.vue";
import Artist from "./views/artist/Artist.vue";
import Auth from "./views/auth/Auth.vue";
import Home from "./views/home/Home.vue";
import Login from "./views/Login.vue";
import Collection from "./views/playlist/Collection.vue";
import Playlist from "./views/playlist/Playlist.vue";

export enum RouteName {
  Home = "/",
  Login = "/login",
  About = "/about",
  Auth = "/auth",
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
    name: "login",
    component: Login,
  },
  {
    component: Artist,
    name: "Artist",
    path: "/artist/:id",
    props: (route) => ({ id: route.params.id }),
  },
  {
    component: Album,
    name: "Album",
    path: "/album/:id",
    props: (route) => ({ id: route.params.id }),
  },
  {
    component: Playlist,
    name: "Playlist",
    path: "/playlist/:id",
    props: (route) => ({ id: route.params.id }),
  },
  {
    component: Collection,
    name: "Collection",
    path: "/collection/:id",
    props: (route) => ({ id: route.params.id }),
  },
  {
    path: RouteName.Auth,
    name: "Auth",
    component: Auth,
    props: (route: RouteLocation) => ({ query: route.query.code }),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

router.beforeEach(async (to) => {
  if (!store.state.auth.me?.display_name && to.path !== RouteName.Login && to.path !== RouteName.Auth) {
    router.push(RouteName.Login);
  }
});

export default router;
