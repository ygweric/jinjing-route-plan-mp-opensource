<template>
  <scroll-view class="page-con w-full h-full bg-white">
    <view class="w-full h-full flex items-center flex-col gap-y-2 mt-4">
      <!-- <button class="w-80" openType="feedback">错误反馈</button> -->
      <button class="w-80" openType="contact">错误反馈、联系作者</button>
      <button class="w-80" @click="gotoAddWechat">加微信</button>
      <button class="w-80" @click="gotoDesc">点位说明</button>
      <view>版本号 {{ version }}</view>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
  import { getVersion } from '@/src/utils/version';
  import Taro from '@tarojs/taro';
  import { onMounted, ref } from 'vue';
  import { useAppStore } from '@/src/store';
  import { setupSetting } from '@/src/utils/syncAppData';

  const version = ref(getVersion());
  const appStore = useAppStore();

  const gotoAddWechat = () => {
    Taro.navigateTo({
      url: `/pages/addWechat/index?wxGroupImg=${appStore.setting?.wx_group_img}`,
    });
  };
  const gotoDesc = () => {
    Taro.navigateTo({
      url: `/pages/web/index?title=点位说明&url=${appStore.setting?.point_desc}`,
    });
  };

  onMounted(async () => {
    setupSetting();
  });
</script>

<style lang="scss"></style>
