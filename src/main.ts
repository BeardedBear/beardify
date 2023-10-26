import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import App from "./App.vue";
import { useConfig } from "./components/config/ConfigStore";
import router, { RouteName } from "./router";
import { useAuth } from "./views/auth/AuthStore";

const app = createApp(App);
const pinia = createPinia();

function syncLS(key: string, value: string): void {
  if (!localStorage.getItem(key)) localStorage.setItem(key, value);
}

app.use(pinia);
pinia.use(piniaPluginPersistedstate);
app.use(router);

useAuth()
  .refresh()
  .then((done) => {
    if (done) {
      app.mount("#app");
      useConfig().switchScheme(useConfig().schemeLabel);
      useConfig().switchTheme(useConfig().themeLabel);
      syncLS("beardify-config", JSON.stringify(useConfig().$state));
      syncLS("beardify-auth", JSON.stringify(useAuth().$state));
    }
  })
  .catch(() => {
    app.mount("#app");
    router.push(`${RouteName.Login}?ref=${window.location.pathname}`);
  });
