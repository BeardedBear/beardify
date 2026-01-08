<template>
  <div v-if="notificationStore.notifications.length !== 0" class="notification-list">
    <div
      v-for="(notif, index) in notificationStore.notifications"
      :key="index"
      :class="{ error: notif.type === NotificationType.Error }"
      class="notification"
    >
      {{ notif.msg }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NotificationType } from "@/@types/Notification";
import { useNotification } from "@/components/notification/NotificationStore";

const notificationStore = useNotification();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

@keyframes pop-notif {
  0%,
  100% {
    opacity: 0;
    transform: translateX(5rem);
  }

  5%,
  95% {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-list {
  $offset: 4rem;

  bottom: $offset + 4rem;
  isolation: isolate;
  position: absolute;
  right: $offset + 1rem;
  z-index: 999;
}

.notification {
  animation: pop-notif 4s ease-in-out both;
  background: rgb(73 145 52);
  border-radius: 0.3rem;
  color: #fff;
  font-size: var(--font-size-sm);

  @include font-bold;

  margin-top: 0.8rem;
  padding: 0.4rem 1rem;
  position: relative;
  transition: all 0.5s;

  &.error {
    background: rgb(185 50 50);
  }
}
</style>
