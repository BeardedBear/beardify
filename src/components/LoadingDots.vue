<template>
  <div class="lds-ellipsis">
    <div />
    <div />
    <div />
    <div />
  </div>
</template>

<style lang="scss" scoped>
.lds-ellipsis {
  display: inline-block;
  height: 5rem;
  position: relative;
  width: 5rem;
}

.lds-ellipsis div {
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
  background: var(--primary-color);
  border-radius: 50%;
  height: 13px;
  position: absolute;
  top: 33px;
  width: 13px;
}

.lds-ellipsis div:nth-child(1) {
  animation: lds-ellipsis1 0.6s infinite;
  left: 8px;
}

.lds-ellipsis div:nth-child(2) {
  animation: lds-ellipsis2 0.6s infinite;
  left: 8px;
}

.lds-ellipsis div:nth-child(3) {
  animation: lds-ellipsis2 0.6s infinite;
  left: 32px;
}

.lds-ellipsis div:nth-child(4) {
  animation: lds-ellipsis3 0.6s infinite;
  left: 56px;
}

@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}

@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(24px, 0);
  }
}
</style>
