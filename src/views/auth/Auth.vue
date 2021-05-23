<script lang="ts">
import { defineComponent, onMounted, PropType } from "vue";
import { useStore } from "vuex";
import { SidebarActions } from "../../components/sidebar/SidebarStore";
import router from "../../router";
import { AuthActions } from "../auth/AuthStore";
import { api } from "../../api";

export default defineComponent({
  name: "Auth",
  props: {
    query: {
      default: "",
      type: String as PropType<string>,
    },
  },
  setup(props) {
    const store = useStore();
    onMounted(() =>
      store.dispatch(AuthActions.auth, props.query).then(() => {
        store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);
        router.push("/");
      })
    );
  },
});
</script>
