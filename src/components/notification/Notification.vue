<template>
  <div class="notification-list">
    <div v-for="(notif, index) in store.state.notification.notifications" :key="index" class="notification">
      {{ notif.type }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    return { store };
  },
});
</script>

<style lang="scss" scoped>
@keyframes popNotif {
  0%,
  100% {
    opacity: 0;
    transform: translateY(50px);
  }
  5%,
  95% {
    opacity: 1;
    transform: translateY(0);
  }
}
.notification-list {
  $offset: 20px;
  bottom: $offset;
  position: absolute;
  right: $offset;
  z-index: 9;
}

.notification {
  animation: popNotif 4s ease-in-out both;
  background: rgb(185, 50, 50);
  border-radius: 5px;
  margin-top: 10px;
  padding: 10px 15px;
  position: relative;
  transition: all 0.5s;
}
</style>
