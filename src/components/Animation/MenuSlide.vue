<template>
  <Transition name="menu-slide">
    <div
      v-bind="$attrs"
      v-if="visible"
      :class="`${enterDirection} ${exitDirection}${
        props.fullSize ? ' full-size' : ''
      }`"
    >
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { choose } from '@/utils/Random';
  import '@/styles/sliding-keyframes.css';

  defineOptions({
    inheritAttrs: false,
  });

  const props = defineProps({
    fullSize: {
      type: Boolean,
    },
  });

  const visible = ref(false),
    enterDirection = ref(`enter-${choose('top', 'bottom', 'left', 'right')}`),
    exitDirection = ref(`exit-${choose('top', 'bottom', 'left', 'right')}`);

  function rechoose() {
    enterDirection.value = `enter-${choose('top', 'bottom', 'left', 'right')}`;
    exitDirection.value = `exit-${choose('top', 'bottom', 'left', 'right')}`;
  }

  async function show() {
    if (visible.value) return;
    rechoose();
    visible.value = true;
    // Wait for the animation to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function hide() {
    if (!visible.value) return;
    rechoose();
    visible.value = false;
    // Wait for the animation to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  defineExpose({ show, hide });
</script>

<style scoped>
  div.full-size {
    width: 100vw;
    height: 100vh;
  }

  .menu-slide-enter-active.enter-top {
    animation: slide-in-top 1s ease-in-out;
  }

  .menu-slide-leave-active.exit-top {
    animation: slide-in-top 1s ease-in-out reverse;
  }

  .menu-slide-enter-active.enter-bottom {
    animation: slide-in-bottom 1s ease-in-out;
  }

  .menu-slide-leave-active.exit-bottom {
    animation: slide-in-bottom 1s ease-in-out reverse;
  }

  .menu-slide-enter-active.enter-left {
    animation: slide-in-left 1s ease-in-out;
  }

  .menu-slide-leave-active.exit-left {
    animation: slide-in-left 1s ease-in-out reverse;
  }

  .menu-slide-enter-active.enter-right {
    animation: slide-in-right 1s ease-in-out;
  }

  .menu-slide-leave-active.exit-right {
    animation: slide-in-right 1s ease-in-out reverse;
  }
</style>
