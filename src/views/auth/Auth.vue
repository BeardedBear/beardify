<script lang="ts" setup>
import { defineProps } from "vue";
import router from "../../router";
import { useAuth } from "./AuthStore";

const props = defineProps({
  query: {
    default: "",
    type: String,
  },
});

const authStore = useAuth();

authStore.authentification(props.query);
router.push("/");
</script>
