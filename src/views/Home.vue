<template>
  <div class="home">
    <div>
      <b>accessToken</b> :{{ store.state.auth.auth.accessToken }}<br /><br />
      <b>refreshToken</b> :{{ store.state.auth.auth.refreshToken }}<br /><br />
      <b>code</b> :{{ store.state.auth.auth.code }}<br /><br />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    return { store };
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  line-break: anywhere;
}
</style>
