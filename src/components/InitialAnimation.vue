<template>
  <EnterExitSlide ref="proBanner" :duration="2000">
    <img :src="professionalBanner" alt="Professional Banner" />
    <h1>Very Professional Video Games Incorporated ™©®</h1>
  </EnterExitSlide>
  <EnterExitSlide ref="iwcProd" :duration="2000" direction="right-to-left">
    <h1>An <i>Idiots with Computers ™©®</i> Production</h1>
  </EnterExitSlide>
  <EnterExitSlide ref="awardWinning" :duration="2000" direction="left-to-right">
    <h1>An Award Winning, Sad Excuse of a """"Video Game""""</h1>
  </EnterExitSlide>
  <EnterExitSlide ref="comingSoon" :duration="2000" direction="bottom-to-top">
    <h1>Coming Soon To Theaters and LaserDisc...</h1>
  </EnterExitSlide>
  <EnterExitSlide ref="comingSoon2" :duration="2000">
    <h1>...and also to your local Blockbuster Video™©®</h1>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  import EnterExitSlide from './EnterExitSlide.vue';
  import professionalBanner from '@/assets/images/lol.jpg';
  import { ref } from 'vue';

  let proBanner = ref<typeof EnterExitSlide>(),
    iwcProd = ref<typeof EnterExitSlide>(),
    awardWinning = ref<typeof EnterExitSlide>(),
    comingSoon = ref<typeof EnterExitSlide>(),
    comingSoon2 = ref<typeof EnterExitSlide>();

  async function begin() {
    await proBanner.value?.begin();
    await iwcProd.value?.begin();
    await awardWinning.value?.begin();
    await comingSoon.value?.begin();
    await comingSoon2.value?.begin();
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

  h1 {
    /* Scale the font size to match the width of the image regardless of the screen size */
    font-size: calc(75vw / 25.5);
    font-weight: 900;
    color: #ff0000;
    text-shadow: 0 0 10px #ff0000;
  }
</style>
