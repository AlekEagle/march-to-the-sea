<template>
  <MenuSlide ref="menuSlide">
    <h1>A March to the Sea</h1>
    <h2>The Video Game</h2>

    <div class="button-container">
      <button @click="emit('start')">Play</button>
      <button @click="emit('about')">About</button>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';

  // Other
  import { ref } from 'vue';

  const menuSlide = ref<typeof MenuSlide>();

  const emit = defineEmits(['start', 'about']);

  function show(): Promise<void> {
    return menuSlide.value?.show();
  }

  function hide(): Promise<void> {
    return menuSlide.value?.hide();
  }

  defineExpose({ show, hide });
</script>
