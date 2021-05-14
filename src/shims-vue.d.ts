declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<unknown, unknown, any>;
  export default component;
}

declare module "pkce";
