<template>
  <view class="page-con w-screen h-screen bg-white">
    <nut-toast
      :title="toastState.title"
      :msg="toastState.msg"
      v-model:visible="toastState.show"
      :type="toastState.type"
      :duration="toastState.duration"
    />
    <view class="w-full h-[30%] absolute top-0 left-0">
      <map
        id="map"
        class="w-full h-full"
        :longitude="longitude"
        :latitude="latitude"
        :scale="scale"
        :markers="markers"
        :polyline="polyline"
        :show-location="true"
      ></map>
    </view>
    <view class="w-full h-[70%] absolute bottom-0 left-0">
      <nut-empty
        v-if="!comments.length"
        image="empty"
        description=""
      ></nut-empty>
      <scroll-view
        v-else
        :scroll-y="true"
        :style="`height: calc(100% - 50px);`"
      >
        <view
          v-for="(comment, index) in comments"
          :key="comment.id"
          class="relative mb-2 ml-4 mr-4 mt-2"
          @click="onSelectComment(comment, index)"
        >
          <div class="w-full flex justify-between items-center mb-1">
            <div class="text-green-600">{{ comment.nickname }}</div>
            <div class="text-gray-500 text-xs mt-1 mb-1">{{
              dayjs(comment.updateDate).format('YYYY-MM-DD HH:mm')
            }}</div>
          </div>
          <div class="mb-1">{{ comment.content }}</div>
          <div class="h-[1px] bg-slate-200"></div>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import env from '@/src/env';
  import { useAppStore } from '@/src/store';
  import { fetchData } from '@/utils/api';
  import Taro from '@tarojs/taro';
  import dayjs from 'dayjs';
  // import { ToastType } from 'types';
  import { onMounted, reactive, ref } from 'vue';

  const appStore = useAppStore();

  const longitude = ref(appStore.currentLongitude);
  const latitude = ref(appStore.currentLatitude);
  const scale = ref(14);

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

  const comments = ref<any[]>([]);
  const selectedIndex = ref(0);

  const markers = ref<any[]>([]);
  const polyline = ref<any[]>([]);

  // const showToast = (type: ToastType, title, msg, duration = 2000) => {
  //   toastState.show = true;
  //   toastState.type = type;
  //   toastState.title = title;
  //   toastState.msg = msg;
  //   toastState.duration = duration;
  // };

  const onSelectComment = (poi, index) => {
    console.log('onSelectComment:', poi);
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

  const getComments = async (cameraId: string) => {
    Taro.showLoading({ title: '加载中' });
    const res = await fetchData(
      `${env.host}/cameraDetail`,
      'get',
      {
        current: 1,
        pageSize: 100,
        cameraId,
        orderConditionList: [
          {
            column: 'updateDate',
            order: 'DESC',
          },
        ],
      }
    );
    Taro.hideLoading();
    if (res.code !== 0) {
      console.error(res.msg);
      return;
    }

    comments.value = res.data.data;
  };

  const setupData = async () => {
    const markerStr = Taro.getCurrentInstance().router?.params.marker;
    if (!markerStr) {
      console.error('摄像头数据为空');
      return;
    }
    const marker = JSON.parse(markerStr);

    markers.value = [
      {
        ...marker,
        width: 40,
        height: 40,
        callout: {
          content: marker.name || '未知点位名称',
          padding: 10,
          borderRadius: 2,
          display: 'ALWAYS',
        },
      },
    ];

    longitude.value = marker.longitude;
    latitude.value = marker.latitude;
    await getComments(marker.cameraId);
  };

  onMounted(async () => {
    setupData();
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
