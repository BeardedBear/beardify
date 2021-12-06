import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router, { RouteName } from "./router";
import { useAuth } from "./views/auth/AuthStore";
import KeyboardEvents from "./composition/KeyboardEvents";
import { useConfig } from "./components/config/ConfigStore";
import { Config } from "./@types/Config";

const app = createApp(App);
const configStorage = localStorage.getItem("BeardifyConfig");

app.use(createPinia());
app.use(router);

useAuth()
  .refresh()
  .then((done) => {
    if (done) {
      KeyboardEvents();
      app.mount("#app");
      if (configStorage) {
        const ls: Config = JSON.parse(configStorage);
        useConfig().switchScheme(ls.schemeLabel);
        useConfig().switchTheme(ls.themeLabel);
      }
    }
  })
  .catch(() => {
    app.mount("#app");
    router.push(RouteName.Login);
  });
