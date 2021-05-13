<template>
  <div class="config">
    <div class="user">
      <div>{{ store.state.auth.me.display_name }}</div>
      <div class="user__mail">{{ store.state.auth.me.email }}</div>
    </div>
    <div class="links">
      <router-link class="links__item button" to="/login">Login</router-link>
    </div>
    <Colors />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import Colors from "./Colors.vue";

export default defineComponent({
  components: { Colors },
  setup() {
    const store = useStore<RootState>();

    return { store };
  }
});
</script>

<style lang="scss" scoped>
@keyframes popConfig {
  from {
    opacity: 0;
    transform: scale(0);
    transform-origin: top right;
  }
}

.links {
  &__item {
    width: 100%;
    display: block;
  }
}

.user {
  margin-bottom: 20px;

  &__mail {
    margin-top: 2px;
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.5;
  }
}
.config {
  animation: popConfig ease 0.2s both;
  background-color: var(--bg-color-darker);
  padding: 20px;
  position: absolute;
  top: calc(100% - 3px);
  right: 20px;
  border-radius: 4px;
  width: 250px;
  box-shadow: 0 5px 10px rgba(black, 0.2);
  z-index: 999;
}
</style>
