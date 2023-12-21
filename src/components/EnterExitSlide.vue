<template>
  <Transition type="animation" name="enter-exit-slide">
    <div v-if="visible" :class="props.direction">
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  const props = defineProps({
    duration: {
      type: Number,
      default: 1000,
    },
    direction: {
      type: String,
      default: 'top-to-bottom',
    },
  });

  const visible = ref(false);

  async function begin() {
    visible.value = true;
    // Wait for the animation to finish + the specified duration
    await new Promise((resolve) => setTimeout(resolve, props.duration + 1000));
    visible.value = false;
    // Wait for the animation to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  defineExpose({ begin });
</script>

<style scoped>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .enter-exit-slide-enter-active.top-to-bottom {
    animation: slide-in-top 1s ease-out;
  }

  .enter-exit-slide-leave-active.top-to-bottom {
    animation: slide-in-bottom 1s ease-out reverse;
  }

  .enter-exit-slide-enter-active.bottom-to-top {
    animation: slide-in-bottom 1s ease-out;
  }

  .enter-exit-slide-leave-active.bottom-to-top {
    animation: slide-in-top 1s ease-out reverse;
  }

  .enter-exit-slide-enter-active.left-to-right {
    animation: slide-in-left 1s ease-out;
  }

  .enter-exit-slide-leave-active.left-to-right {
    animation: slide-in-right 1s ease-out reverse;
  }

  .enter-exit-slide-enter-active.right-to-left {
    animation: slide-in-right 1s ease-out;
  }

  .enter-exit-slide-leave-active.right-to-left {
    animation: slide-in-left 1s ease-out reverse;
  }

  @keyframes slide-in-top {
    from {
      transform: translateY(-100vh);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slide-in-bottom {
    from {
      transform: translateY(100vh);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slide-in-left {
    from {
      transform: translateX(-100vw);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slide-in-right {
    from {
      transform: translateX(100vw);
    }
    to {
      transform: translateX(0);
    }
  }
</style>
