import { createRouter, createWebHistory, RouteRecordRaw, RouteLocation } from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Auth from "./views/auth/Auth.vue";
import Artist from "./views/artist/Artist.vue";
import Album from "./views/album/Album.vue";
import Login from "./views/Login.vue";
import Store from "./store";
import { instance } from "./api";
import store from "./store";
import { PlayerActions } from "./components/player/PlayerStore";
import { AuthActions } from "./views/auth/AuthStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    component: About
  },
  {
    path: "/login",
    name: "Alogin",
    component: Login
  },
  {
    component: Artist,
    name: "Artist",
    path: "/artist/:id",
    props: route => ({ id: route.params.id })
  },
  {
    component: Album,
    name: "Album",
    path: "/album/:id",
    props: route => ({ id: route.params.id })
  },
  {
    path: "/auth",
    name: "Auth",
    component: Auth,
    props: (route: RouteLocation) => ({ query: route.query.code })
  }
];

const router = createRouter({
  // history: createWebHistory(processenv.BASE_URL),=)
  history: createWebHistory("/"),
  routes
});

router.beforeEach(async to => {
  if (!Store.state.auth.me.display_name && to.path !== "/login" && to.path !== "/auth") {
    instance.get("https://api.spotify.com/v1/me/player").then(e => {
      if (e.status !== 200) {
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
        store.dispatch(`auth/${AuthActions.refresh}`);
      }
    });

    router.push("/login");
  }
});

export default router;
