<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import router from "../router";
import { AuthActions } from "../views/AuthStore";

export default defineComponent({
  name: "Auth",
  props: ["query"],
  setup(props) {
    const store = useStore();
    onMounted(() => store.dispatch(`auth/${AuthActions.auth}`, props.query).then(() => router.push("/")));
  }
});
</script>
