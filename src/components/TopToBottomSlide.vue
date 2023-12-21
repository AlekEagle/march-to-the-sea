<template>
  <Transition type="animation" name="slide-top-to-bottom">
    <div v-if="visible">
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

  .slide-top-to-bottom-enter-active {
    animation: slide-in-top 1s ease-out;
  }

  .slide-top-to-bottom-leave-active {
    animation: slide-in-bottom 1s ease-out reverse;
  }

  @keyframes slide-in-top {
    from {
      transform: translateY(-1000px);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slide-in-bottom {
    from {
      transform: translateY(1000px);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
