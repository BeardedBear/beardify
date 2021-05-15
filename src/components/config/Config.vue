<template>
  <div class="config">
    <div class="user">
      <div>{{ store.state.auth.me?.display_name }}</div>
      <div class="user__mail">
        {{ store.state.auth.me?.email }}
      </div>
    </div>

    <div v-if="env !== 'production'" class="section">
      <div class="section__title">Debug</div>
      <router-link class="button button--full" to="/login"> Login </router-link>
      <button class="button button--full" @click="refresh()">Refresh token</button>
    </div>

    <div class="section">
      <div class="section__title">Couleurs</div>
      <Colors />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { AuthActions } from "../../views/auth/AuthStore";
import Colors from "./Colors.vue";

export default defineComponent({
  components: { Colors },
  setup() {
    const store = useStore<RootState>();
    const env = process.env.NODE_ENV;

    function refresh(): void {
      store.dispatch(`auth/${AuthActions.refresh}`);
    }

    return { store, refresh, env };
  },
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

.section {
  padding: 7px 10px 10px;
  border: 1px solid var(--bg-color-dark);
  margin-top: 15px;
  border-radius: 5px;
  background: var(--bg-color-light);
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__title {
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.8rem;
    opacity: 0.5;
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
