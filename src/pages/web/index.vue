<template>
  <web-view class="page-con w-full h-full bg-white" :src="url"> </web-view>
</template>

<script lang="ts" setup>
  import Taro from '@tarojs/taro';
  import { onMounted, ref } from 'vue';

  const url = ref('');

  onMounted(async () => {
    const origUrl = Taro.getCurrentInstance().router?.params.url as string;
    const title = Taro.getCurrentInstance().router?.params.title as string;

    let newUrl = decodeURIComponent(origUrl);
    if (newUrl.startsWith('http://')) {
      newUrl = newUrl.replace('http://', 'https://');
    }
    console.log(`web url: ${newUrl}`);
    url.value = newUrl;
    Taro.setNavigationBarTitle({ title: title || '' });
  });
</script>

<style lang="scss"></style>
