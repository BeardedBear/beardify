import { createRouter, createWebHistory, RouteRecordRaw, RouteLocation } from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Auth from "./views/auth/Auth.vue";
import Artist from "./views/artist/Artist.vue";
import Album from "./views/album/Album.vue";
import Playlist from "./views/playlist/Playlist.vue";
import Collection from "./views/playlist/Collection.vue";
import Login from "./views/Login.vue";
import store from "./store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/login",
    name: "Alogin",
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
    path: "/auth",
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
  if (!store.state.auth.me?.display_name && to.path !== "/login" && to.path !== "/auth") {
    router.push("/login");
  }
});

export default router;
