<template>
  <div>Authenticating...</div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

import { useAuth } from "./AuthStore";

const props = defineProps<{ query: string }>();

const authStore = useAuth();

onMounted(async () => {
  await authStore.authentification(props.query);
});
</script>
