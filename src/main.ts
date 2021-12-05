import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router, { RouteName } from "./router";
import { useAuth } from "./views/auth/AuthStore";
import KeyboardEvents from "./composition/KeyboardEvents";
import { useConfig } from "./components/config/ConfigStore";

const app = createApp(App);
const ls = localStorage.getItem("BeardifyConfig");

app.use(createPinia());
app.use(router);

useAuth()
  .refresh()
  .then((done) => {
    if (done) {
      if (ls) {
        useConfig().switchScheme(JSON.parse(ls).schemeLabel);
        useConfig().switchTheme(JSON.parse(ls).themeLabel);
      }
      KeyboardEvents();
      app.mount("#app");
    }
  })
  .catch(() => {
    app.mount("#app");
    router.push(RouteName.Login);
  });
