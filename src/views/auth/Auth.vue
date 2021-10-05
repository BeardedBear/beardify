<template>Auth</template>
<script lang="ts" setup>
import { defineProps } from "vue";
import { useAuth } from "./AuthStore";

const props = defineProps({
  query: {
    default: "",
    type: String,
  },
});

console.log("props.query", props.query);
const authStore = useAuth();

authStore.authentification(props.query);
</script>
