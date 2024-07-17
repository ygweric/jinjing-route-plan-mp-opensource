<template>
  <view class="page-con w-screen h-screen bg-white">
    <nut-toast
      :title="toastState.title"
      :msg="toastState.msg"
      v-model:visible="toastState.show"
      :type="toastState.type"
      :duration="toastState.duration"
    />
    <view class="w-full flex">
      <view class="bg-white-100 w-18 flex items-center justify-center">
        <nut-button type="default" @click="switchPlace">
          <template #icon>
            <Retweet></Retweet>
          </template>
        </nut-button>
      </view>
      <view class="flex-1">
        <nut-input
          :model-value="appStore.fromAddress?.name"
          class="!pl-2"
          placeholder="点击选择起点"
          clearable
          readonly
          @click="chooseAddress('fromAddress')"
        >
          <template #left>
            <view class="text-gray-600 mr-4">起点</view>
          </template>
        </nut-input>
        <nut-input
          :model-value="appStore.toAddress?.name"
          class="!pl-2"
          placeholder="点击选择终点"
          clearable
          readonly
          @click="chooseAddress('toAddress')"
        >
          <template #left>
            <view class="text-gray-600 mr-4">终点</view>
          </template>
        </nut-input>
      </view>
      <view class="bg-white-100 w-28 flex items-center justify-center">
        <nut-button type="default" @click="gotoRoutePage">
          查看线路
        </nut-button>
      </view>
    </view>
    <scroll-view
      v-if="historyRoutes.length > 0"
      :scroll-y="true"
      class="mt-4 h-[calc(100%-200px)]"
    >
      <view
        v-for="route in historyRoutes"
        :key="route.name"
        class="relative mt-2 mb-2 ml-4 mr-4"
        @click="onSelectRoute(route)"
      >
        <div class="text-gray-600 mb-4">{{ route.name }}</div>
        <div class="h-[1px] bg-slate-200 mb-2"></div>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
  import env from '@/src/env';
  import { useAppStore } from '@/src/store';
  import Taro from '@tarojs/taro';
  import { RouteType, ToastType } from 'types';
  import { onMounted, reactive, ref } from 'vue';
  import { Retweet } from '@nutui/icons-vue-taro';

  const appStore = useAppStore();

  const toastState = reactive({
    msg: 'toast',
    type: 'text',
    show: false,
    cover: false,
    title: '',
    bottom: '',
    center: true,
    duration: 2000,
  });
  const historyRoutes = ref<RouteType[]>(
    Taro.getStorageSync('routeHistory') || []
  );

  const showToast = (type: ToastType, title, msg, duration = 2000) => {
    toastState.show = true;
    toastState.type = type;
    toastState.title = title;
    toastState.msg = msg;
    toastState.duration = duration;
  };

  const chooseAddress = async (storeKey) => {
    Taro.navigateTo({
      url: `/pages/chooseLocation/index?storeKey=${storeKey}`,
    });
  };

  const onSelectRoute = (route: RouteType) => {
    appStore.fromAddress = route.from;
    appStore.toAddress = route.to;
    Taro.showToast({
      title: `已切换为${route.name}`,
      icon: 'none',
      duration: 2000,
    });
  };
  const switchPlace = () => {
    const tmp = appStore.fromAddress;
    appStore.fromAddress = appStore.toAddress;
    appStore.toAddress = tmp;
    Taro.showToast({
      title: `已交换位置`,
      icon: 'none',
      duration: 2000,
    });
  };
  const gotoRoutePage = async () => {
    if (!appStore.fromAddress || !appStore.toAddress) {
      showToast('warn', null, '请选择起点、终点');
      return;
    }

    const routeName = `${appStore.fromAddress.name} -> ${appStore.toAddress.name}`;

    historyRoutes.value = [
      {
        name: routeName,
        from: appStore.fromAddress,
        to: appStore.toAddress,
      }, // 最近搜索的排第一个
      ...historyRoutes.value.filter((route) => route.name !== routeName),
    ];

    Taro.setStorageSync('routeHistory', historyRoutes.value.slice(0, 100)); // 最多100个，要不然小程序要报错了
    const fromAddressStr = {
      name: appStore.fromAddress.name,
      location: appStore.fromAddress.location,
    };
    const toAddressStr = {
      name: appStore.toAddress.name,
      location: appStore.toAddress.location,
    };
    Taro.navigateTo({
      url: `/pages/route/index?fromAddressStr=${JSON.stringify(
        fromAddressStr
      )}&toAddressStr=${JSON.stringify(toAddressStr)}`,
    });
  };

  onMounted(async () => {
    if (!env.isProd) {
      appStore.fromAddress = env.defaultFromAddress;
      appStore.toAddress = env.defaultToAddress;
    }
  });
</script>

<style lang="scss"></style>
