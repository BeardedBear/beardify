<script lang="ts" setup>
import { defineProps } from "vue";
import { useAuth } from "./AuthStore";
// import { useStore } from "vuex";
// import { SidebarActions } from "../../components/sidebar/SidebarStore";
// import router from "../../router";
// import { AuthActions } from "../auth/AuthStore";
// import { api } from "../../api";

const props = defineProps({
  query: {
    default: "",
    type: String,
  },
});

console.log("props.query", props.query);
// const store = useStore();
const authStore = useAuth();

authStore.authentification(props.query);

// onMounted(() =>
//   store.dispatch(AuthActions.auth, props.query).then(() => {
//     store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);
//     router.push("/");
//   }),
// );
</script>
