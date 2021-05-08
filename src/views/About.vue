<template>
  <div class="about">azdzad</div>
</template>

<script lang="ts">
import { RootState } from "../@types/RootState";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    return { store };
  }
});
</script>
