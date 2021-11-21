import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router, { RouteName } from "./router";
import { useAuth } from "./views/auth/AuthStore";

const app = createApp(App);

app.use(createPinia());
app.use(router);

useAuth()
  .refresh()
  .then((done) => {
    if (done) app.mount("#app");
  })
  .catch(() => {
    app.mount("#app");
    router.push(RouteName.Login);
  });
