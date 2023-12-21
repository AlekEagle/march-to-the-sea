<template>
  <InitialAnimation ref="initAnim" />
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import InitialAnimation from '@/components/InitialAnimation.vue';

  const initAnim = ref<typeof InitialAnimation>();

  onMounted(async () => {
    await initAnim.value?.begin();
  });

  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
    return '';
  });
</script>
