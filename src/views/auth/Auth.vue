<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { PlayerActions } from "../../components/player/PlayerStore";
import { SidebarActions } from "../../components/sidebar/SidebarStore";
import router from "../../router";
import { AuthActions } from "../auth/AuthStore";

export default defineComponent({
  name: "Auth",
  props: ["query"],
  setup(props) {
    const store = useStore();
    onMounted(() =>
      store.dispatch(`auth/${AuthActions.auth}`, props.query).then(() => {
        store.dispatch(`player/${PlayerActions.getDeviceList}`);
        store.dispatch(`sidebar/${SidebarActions.getPlaylists}`, "https://api.spotify.com/v1/me/playlists?limit=50");
        router.push("/");
      })
    );
  }
});
</script>
