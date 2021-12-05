<template>
  <div class="notification-list">
    <div
      v-for="(notif, index) in notificationStore.notifications"
      :key="index"
      class="notification"
      :class="{ error: notif.type === NotificationType.Error }"
    >
      {{ notif.msg }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NotificationType } from "../../@types/Notification";
import { useNotification } from "./NotificationStore";

const notificationStore = useNotification();
</script>

<style lang="scss" scoped>
@keyframes pop-notif {
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
  $offset: 2.2rem;

  position: absolute;
  right: $offset;
  top: $offset + 2.2rem;
  z-index: 9;
}

.notification {
  animation: pop-notif 4s ease-in-out both;
  background: rgb(33 124 33);
  border-radius: 0.4rem;
  margin-top: 0.8rem;
  padding: 0.8rem 1rem;
  position: relative;
  transition: all 0.5s;

  &.error {
    background: rgb(185 50 50);
  }
}
</style>
