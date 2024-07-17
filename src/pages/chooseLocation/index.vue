<template>
  <view class="page-con w-screen h-screen bg-white">
    <nut-toast
      :title="toastState.title"
      :msg="toastState.msg"
      v-model:visible="toastState.show"
      :type="toastState.type"
      :duration="toastState.duration"
    />
    <view class="w-full h-[50%] absolute top-0 left-0">
      <map
        id="map"
        class="w-full h-full"
        :longitude="longitude"
        :latitude="latitude"
        :scale="scale"
        :markers="markers"
        :polyline="polyline"
        :show-location="true"
        @markertap="markertap"
      ></map>
    </view>
    <view class="w-full h-[50%] absolute bottom-0 left-0">
      <nut-input
        v-model="keyword"
        placeholder="请输入地址"
        clearable
        @confirm="onSearchPoi"
      >
        <template #right>
          <nut-button type="default" size="small" @click="onSearchPoi">
            搜索
          </nut-button>
        </template>
      </nut-input>
      <scroll-view
        v-if="!keyword && historyKeywords"
        :scroll-y="true"
        :style="`height: calc(100% - 100px);`"
      >
        <view
          v-for="key in historyKeywords"
          :key="key"
          class="relative mt-2 mb-2 ml-4 mr-4"
          @click="onSelectKeyword(key)"
        >
          <div class="text-gray-600 mb-2">{{ key }}</div>
          <div class="h-[1px] bg-slate-200 mb-2"></div>
        </view>
      </scroll-view>
      <scroll-view
        v-if="pois.length && keyword === currentPoikeyword"
        :scroll-y="true"
        :style="`height: calc(100% - 100px);`"
      >
        <view
          v-for="(poi, index) in pois"
          :key="poi.id"
          class="relative mb-2 ml-4 mr-4 mt-2"
          @click="onSelectPoi(poi, index)"
        >
          <div class="text-green-600">{{ poi.name }}</div>
          <div class="text-gray-500 text-xs mt-1 mb-1">{{ poi.address }}</div>
          <div class="h-[1px] bg-slate-200"></div>
          <nut-button
            v-if="selectedIndex === index"
            type="primary"
            size="small"
            style="position: absolute"
            class="right-2 top-2"
            @click="(e) => onConfirmPoi(poi, e)"
            >选择</nut-button
          >
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import env, { CIPHERS } from '@/src/env';
  import { useAppStore } from '@/src/store';
  import { fetchData } from '@/utils/api';
  import Taro from '@tarojs/taro';
  import { onMounted, reactive, ref } from 'vue';

  const appStore = useAppStore();
  const longitude = ref(appStore.currentLongitude);
  const latitude = ref(appStore.currentLatitude);
  const scale = ref(14);
  const historyKeywords = ref<string[]>(
    Taro.getStorageSync('placeHistory') || []
  );

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

  const keyword = ref('');
  const currentPoikeyword = ref(''); // 清除输入框时候，poi所代表的keyword什么
  const pois = ref<any[]>([]);
  const selectedIndex = ref(0);

  const markers = ref<any[]>([]);
  const polyline = ref<any[]>([]);

  const onConfirmPoi = (poi, e: Event) => {
    console.log('onConfigPoi:', JSON.stringify(poi));
    e.stopPropagation();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { storeKey } = Taro.getCurrentInstance().router!.params;
    appStore[storeKey as keyof typeof appStore] = poi;
    Taro.navigateBack();
  };

  const onSelectPoi = (poi, index) => {
    console.log('onSelectPoi:', poi);
    selectedIndex.value = index;
    markers.value = [
      {
        iconPath: `/assets/images/poi/pin.png`,
        id: Date.now(),
        longitude: poi.longitude,
        latitude: poi.latitude,
        width: 60,
        height: 60,
      },
    ];
    console.log(markers.value);

    longitude.value = poi.longitude;
    latitude.value = poi.latitude;
    scale.value = 15;
  };

  const onSearchPoi = async () => {
    console.log(keyword.value);
    Taro.showLoading({ title: '加载中' });
    const res = await fetchData(
      `https://restapi.amap.com/v3/place/text?key=${CIPHERS.AMAP_KEY}&keywords=${keyword.value}&types=&city=北京&offset=20&page=1`,
      'get'
    );
    Taro.hideLoading();

    if (res.infocode !== '10000') {
      Taro.showModal({
        title: '出错了',
        content: '我们会尽快排查，请您稍后重试',
        showCancel: false,
      });
      return;
    }

    currentPoikeyword.value = keyword.value;
    pois.value = res.pois.map((poi) => {
      const [longitude, latitude] = poi.location.split(',');
      return {
        ...poi,
        longitude,
        latitude,
      };
    });
    historyKeywords.value = [
      keyword.value, // 最近搜索的排第一个
      ...historyKeywords.value.filter((word) => word !== keyword.value),
    ];
    Taro.setStorageSync('placeHistory', historyKeywords.value.slice(0, 100)); // 最多100个，要不然小程序要报错了
    if (pois.value.length > 0) {
      onSelectPoi(pois.value[0], 0);
    }
  };

  const onSelectKeyword = (key: string) => {
    keyword.value = key;
    onSearchPoi();
  };

  const markertap = (e) => {
    console.log('markertap:', e.detail.markerId);
  };

  onMounted(async () => {
    console.log('-', Taro.getCurrentInstance().router?.params);
  });
</script>

<style lang="scss">
  .page-con {
    .nut-input {
      padding-right: 30rpx;
      padding-left: 30rpx;
    }
  }
</style>
