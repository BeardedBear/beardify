import { createRouter, createWebHistory, RouteRecordRaw, RouteLocation } from "vue-router";
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Auth from "@/views/Auth.vue";

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
    path: "/auth",
    name: "Auth",
    component: Auth,
    props: (route: RouteLocation) => ({ query: route.query.code })
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
