<template>
  <MenuSlide ref="menuSlide">
    <h1>A March to the Sea</h1>
    <p>
      A March to the Sea is a game similar to the classic Oregon Trail, but set
      during the American Civil War. You play as Union General William T.
      Sherman as he leads his army on a march through the South. You must manage
      your supplies, your soldiers, and your reputation as you march through the
      Confederacy.
    </p>
    <button @click="emit('close')">Back</button>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';

  // Other
  import { ref } from 'vue';

  const menuSlide = ref<typeof MenuSlide>();

  const emit = defineEmits(['close']);

  function show(): Promise<void> {
    return menuSlide.value?.show();
  }

  function hide(): Promise<void> {
    return menuSlide.value?.hide();
  }

  defineExpose({ show, hide });
</script>

<style scoped>
  p {
    font-size: 1.5rem;
    margin: 0 4rem 1rem;
  }
</style>
