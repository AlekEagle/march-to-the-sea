<template>
  <Transition type="animation" name="enter-exit-slide">
    <div v-if="visible" :class="`${direction}`">
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import WatchOrWait from '@/utils/WatchOrWait';
  import '@/styles/sliding-keyframes.css';

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

  const visible = ref(false),
    isAnimating = ref(false),
    shouldStop = ref(false);

  // If the animation is currently running, immediately stop it and cause the begin() function to return early.
  function stop() {
    if (!isAnimating.value) return;
    shouldStop.value = true;
  }

  // This function is called by the parent component to begin the animation.
  function begin(): Promise<void> {
    return new Promise(async (resolve) => {
      // If the animation is already running, immediately resolve this promise.
      if (isAnimating.value) {
        resolve();
        return;
      }
      // Otherwise, get ready to start the animation.

      // Reset shouldStop
      shouldStop.value = false;
      // Set isAnimating to true
      isAnimating.value = true;
      // Begin the animation by showing the element.
      visible.value = true;

      // Wait for the animation to finish or for the animation to be stopped.
      await WatchOrWait(
        1e3, // Wait 1 second (the duration of the entrance animation)
        shouldStop, // Watch for the animation to be stopped.
      );

      // If the animation was stopped early, skip waiting the rest of the duration.
      if (!shouldStop.value) await WatchOrWait(props.duration, shouldStop);

      // Otherwise, hide the element.
      visible.value = false;

      // Wait for the exit animation to finish.
      await new Promise((resolve) => setTimeout(resolve, 1e3));

      // Set isAnimating to false
      isAnimating.value = false;
      resolve();
    });
  }

  defineExpose({ begin, stop });
</script>

<style scoped>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .enter-exit-slide-enter-active.top-to-bottom:not(.stop-now) {
    animation: slide-in-top 1s ease-out;
  }

  .enter-exit-slide-leave-active.top-to-bottom:not(.stop-now) {
    animation: slide-in-bottom 1s ease-out reverse;
  }

  .enter-exit-slide-enter-active.bottom-to-top:not(.stop-now) {
    animation: slide-in-bottom 1s ease-out;
  }

  .enter-exit-slide-leave-active.bottom-to-top:not(.stop-now) {
    animation: slide-in-top 1s ease-out reverse;
  }

  .enter-exit-slide-enter-active.left-to-right:not(.stop-now) {
    animation: slide-in-left 1s ease-out;
  }

  .enter-exit-slide-leave-active.left-to-right:not(.stop-now) {
    animation: slide-in-right 1s ease-out reverse;
  }

  .enter-exit-slide-enter-active.right-to-left:not(.stop-now) {
    animation: slide-in-right 1s ease-out;
  }

  .enter-exit-slide-leave-active.right-to-left:not(.stop-now) {
    animation: slide-in-left 1s ease-out reverse;
  }

  div.stop-now {
    animation: none !important;
  }
</style>
