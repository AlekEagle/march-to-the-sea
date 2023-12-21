<template>
  <TopToBottomSlide ref="topToBottomSlide" :duration="4000">
    <img :src="professionalBanner" alt="Professional Banner" />
    <h1>Very Professional Video Games Incorporated ™©®</h1>
  </TopToBottomSlide>
</template>

<script lang="ts" setup>
  import TopToBottomSlide from './TopToBottomSlide.vue';
  import professionalBanner from '@/assets/images/lol.jpg';
  import { ref } from 'vue';

  let topToBottomSlide = ref<typeof TopToBottomSlide>();

  async function begin() {
    await topToBottomSlide.value?.begin();
  }

  defineExpose({ begin });
</script>

<style scoped>
  img {
    aspect-ratio: 16/9;
    width: 75vw;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  div > h1 {
    /* Scale the font size to match the width of the image regardless of the screen size */
    font-size: calc(75vw / 25.5);
    font-weight: 900;
    color: #ff0000;
    text-shadow: 0 0 10px #ff0000;
  }
</style>
