<template>
  <EnterExitSlide ref="welcomeCard" :duration="10e3">
    <h1> Welcome! </h1>
    <h2>
      This is The March to the Sea, a game about Union General William T.
      Sherman's march through the South during the American Civil War.
    </h2>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  import EnterExitSlide from '../Animation/EnterExitSlide.vue';
  import { ref } from 'vue';

  const welcomeCard = ref<typeof EnterExitSlide>();

  const emit = defineEmits(['close']);

  function show(): Promise<void> {
    return welcomeCard.value?.show();
  }

  function hide(): Promise<void> {
    return welcomeCard.value?.hide();
  }

  defineExpose({ show, hide });
</script>
