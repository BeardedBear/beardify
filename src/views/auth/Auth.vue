<script setup lang="ts">
import { onMounted, defineProps } from "vue";
import { useStore } from "vuex";
import { SidebarActions } from "../../components/sidebar/SidebarStore";
import router from "../../router";
import { AuthActions } from "../auth/AuthStore";
import { api } from "../../api";

const props = defineProps<{
  query: string;
}>();

const store = useStore();
onMounted(() =>
  store.dispatch(AuthActions.auth, props.query).then(() => {
    store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);
    router.push("/");
  }),
);
</script>
