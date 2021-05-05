import { createRouter, createWebHistory, RouteRecordRaw, RouteLocation } from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Auth from "./views/Auth.vue";
import Login from "./views/Login.vue";
import Store from "./store";

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
    path: "/auth",
    name: "Auth",
    component: Auth,
    props: (route: RouteLocation) => ({ query: route.query.code }),
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHistory("/"),
  routes,
});

router.beforeEach(async (to) => {
  if (!Store.state.auth.me.displayName && to.path !== "/login" && to.path !== "/auth") {
    router.push("/login");
  }
});

export default router;
