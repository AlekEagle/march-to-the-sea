<template>
  <Transition type="animation" name="enter-exit-slide">
    <div
      v-if="visible"
      :class="`${direction}${props.fullSize ? ' full-size' : ''}`"
    >
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { wait, waitFor, watchOrWait } from '@/utils/Wait';
  import '@/styles/sliding-keyframes.css';

  const props = defineProps({
    duration: {
      type: Number,
      default: 0,
    },
    direction: {
      type: String,
      default: 'top-to-bottom',
    },
    cancellable: {
      type: Boolean, // If true, the slide can be stopped early by the user clicking.
    },
    fullSize: {
      type: Boolean,
    },
  });

  const emit = defineEmits(['cancelled']);

  const visible = ref(false),
    isAnimating = ref(false),
    shouldStop = ref(false);

  // If the animation is currently running, immediately stop it and cause the begin() function to return early.
  function stop() {
    if (!isAnimating.value) return;
    shouldStop.value = true;
  }

  // This function is called when the user clicks to cancel the animation.
  // Since it was non-programmatically cancelled, emit the 'cancelled' event so the parent component knows what happened.
  async function cancelAnimation() {
    stop();
    emit('cancelled');
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

      // If the animation is cancellable, add a click listener to the body.
      if (props.cancellable) {
        document.body.addEventListener('click', cancelAnimation, {
          once: true,
        });
      }

      // Begin the animation by showing the element.
      visible.value = true;

      // Wait for the animation to finish.
      await wait(1e3);

      // If the animation was stopped early, skip waiting the rest of the duration.
      if (!shouldStop.value) {
        if (props.duration > 0) await watchOrWait(props.duration, shouldStop);
        else await waitFor(shouldStop);
      }

      // Otherwise, hide the element.
      visible.value = false;

      // Wait for the exit animation to finish.
      await new Promise((resolve) => setTimeout(resolve, 1e3));

      // Set isAnimating to false
      isAnimating.value = false;

      // Remove the click listener from the body.
      document.body.removeEventListener('click', cancelAnimation);

      // Resolve.
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

  div.full-size {
    width: 100vw;
    height: 100vh;
  }

  .enter-exit-slide-enter-active.top-to-bottom:not(.stop-now) {
    animation: slide-in-top 1s ease-in-out;
  }

  .enter-exit-slide-leave-active.top-to-bottom:not(.stop-now) {
    animation: slide-in-bottom 1s ease-in-out reverse;
  }

  .enter-exit-slide-enter-active.bottom-to-top:not(.stop-now) {
    animation: slide-in-bottom 1s ease-in-out;
  }

  .enter-exit-slide-leave-active.bottom-to-top:not(.stop-now) {
    animation: slide-in-top 1s ease-in-out reverse;
  }

  .enter-exit-slide-enter-active.left-to-right:not(.stop-now) {
    animation: slide-in-left 1s ease-in-out;
  }

  .enter-exit-slide-leave-active.left-to-right:not(.stop-now) {
    animation: slide-in-right 1s ease-in-out reverse;
  }

  .enter-exit-slide-enter-active.right-to-left:not(.stop-now) {
    animation: slide-in-right 1s ease-in-out;
  }

  .enter-exit-slide-leave-active.right-to-left:not(.stop-now) {
    animation: slide-in-left 1s ease-in-out reverse;
  }

  div.stop-now {
    animation: none !important;
  }
</style>
