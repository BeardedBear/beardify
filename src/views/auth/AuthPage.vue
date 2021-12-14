<script lang="ts" setup>
import { defineProps } from "vue";
import { useAuth } from "./AuthStore";

const props = defineProps<{ query: string }>();

const authStore = useAuth();

authStore.authentification(props.query);
</script>
