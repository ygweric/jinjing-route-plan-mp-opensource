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
      <scroll-view :scroll-y="true" :style="`height: calc(100% - 50px);`">
        <view
          v-for="(camera, index) in pagedCameras"
          :key="camera.cameraId"
          class="relative mb-2 ml-4 mr-4 mt-2"
          @click="onSelectCamera(camera, index)"
        >
          <div class="w-full flex justify-between items-center mb-1">
            <div class="text-green-600">{{ camera.name }}</div>
          </div>
          <div class="text-gray-500 text-xs mt-4 mb-4"
            >添加日期: {{ dayjs(camera.createDate).format('YYYY-MM-DD') }}</div
          >
          <div class="h-[1px] bg-slate-200"></div>
          <nut-button
            v-if="selectedIndex === index"
            type="primary"
            size="small"
            style="position: absolute"
            class="right-2 bottom-2"
            @click="(e) => showCameraComments(camera, e)"
            >查看评论</nut-button
          >
        </view>
      </scroll-view>
      <nut-pagination
        v-model="currentPage"
        :total-items="cameras.length"
        :items-per-page="200"
        @change="onPageChange"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/src/store';
  import Taro from '@tarojs/taro';
  import dayjs from 'dayjs';
  import { onMounted, reactive, ref } from 'vue';

  const appStore = useAppStore();

  const longitude = ref(appStore.currentLongitude);
  const latitude = ref(appStore.currentLatitude);
  const scale = ref(14);
  const selectedIndex = ref(0);
  const currentPage = ref(1);
  const pageSize = 100;

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

  let cameras = [];
  const pagedCameras = ref<any[]>([]);

  const markers = ref<any[]>([]);
  const polyline = ref<any[]>([]);

  const showCameraComments = (camera, e: Event) => {
    console.log('showCameraComments:', JSON.stringify(camera));
    e.stopPropagation();

    Taro.navigateTo({
      url: `/pages/cameraDetail/index?marker=${JSON.stringify(camera)}`,
    });
  };

  const onPageChange = (page: number) => {
    console.log(page);
    // currentPage.value = page
    pagedCameras.value = cameras.slice((page - 1) * pageSize, page * pageSize);
  };

  const onSelectCamera = (poi, index) => {
    console.log('onSelectCamera:', poi);
    selectedIndex.value = index;
    markers.value = [
      {
        iconPath: `/assets/images/poi/${poi.type}.png`,
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

  const setupData = async () => {
    cameras = appStore.cameraMarkers.sort((a, b) =>
      a.createDate < b.createDate ? 1 : -1
    );

    pagedCameras.value = cameras.slice(0, pageSize);
    onSelectCamera(pagedCameras.value[0], 0);
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
