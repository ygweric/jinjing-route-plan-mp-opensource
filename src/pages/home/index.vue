<template>
  <view class="page-con w-screen h-screen bg-white">
    <nut-noticebar
      v-for="notification in appStore.notifications"
      :key="notification.id"
      :text="notification.content"
    />
    <nut-toast
      :title="toastState.title"
      :msg="toastState.msg"
      v-model:visible="toastState.show"
      :type="toastState.type"
      :duration="toastState.duration"
    />
    <map
      id="map"
      style="width: 100%; height: 100%"
      :longitude="centerLocation.longitude"
      :latitude="centerLocation.latitude"
      scale="13"
      :markers="markers"
      :polyline="polyline"
      :show-location="true"
      @regionchange="regionchange"
      @markertap="onMarkertap"
      @poitap="onTapPoi"
      @callouttap="onCallouttap"
    >
    </map>
    <nut-tabbar
      v-model="activeTabbarName"
      @tab-switch="onTabSwitch"
      bottom
      safe-area-inset-bottom
      placeholder
    >
      <nut-tabbar-item
        v-for="item in tabbarList"
        :key="item.name"
        :name="item.name"
        :tab-title="item.title"
        :dot="item.dot"
        :value="item.value"
      >
        <template #icon>
          <img :src="item.icon" alt="" />
        </template>
      </nut-tabbar-item>
    </nut-tabbar>
  </view>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/src/store';
  import { getAuthoration } from '@/utils/authorize';
  import Taro from '@tarojs/taro';
  import { Location } from 'types';
  import { onMounted, reactive, ref } from 'vue';
  // import * as lzString from 'lz-string';
  import {
    setupAllCameraPois,
    setupNotifications,
    setupSetting,
  } from '@/src/utils/syncAppData';
  import { isMarkerInRegion } from '@/src/utils/geo';

  const appStore = useAppStore();

  const polyline = ref([]);
  const markers = ref<any[]>([]);
  const currentRegion = ref<any>(null);

  const centerLocation = ref<Location>({
    longitude: appStore.currentLongitude,
    latitude: appStore.currentLatitude,
  });

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

  const activeTabbarName = ref('camera_list');
  const tabbarList = ref([
    {
      title: '摄像头列表',
      icon: '/assets/images/menu/camera.png',
      name: 'camera_list',
    },
    {
      title: '线路规划',
      icon: '/assets/images/menu/navigate.png',
      dot: false,
      value: 1,
      name: 'navigate',
    },
    {
      title: '点位说明',
      icon: '/assets/images/menu/help.png',
      name: 'point_desc',
    },
    {
      title: '加微信',
      icon: '/assets/images/menu/addWechat.png',
      name: 'addWechat',
    },
    {
      title: '设置',
      icon: '/assets/images/menu/setting.png',
      name: 'setting',
    },
  ]);

  const onTabSwitch = (_: Record<string, unknown>, name: string) => {
    switch (name) {
      case 'point_desc':
        Taro.navigateTo({
          url: `/pages/web/index?title=点位说明&url=${appStore.setting?.point_desc}`,
        });
        break;
      case 'setting':
        Taro.navigateTo({ url: '/pages/setting/index' });
        break;
      case 'camera_list':
        Taro.navigateTo({ url: '/pages/cameraList/index' });
        break;
      case 'addWechat':
        Taro.navigateTo({ url: '/pages/setting/index' });
        break;
      case 'navigate':
        Taro.navigateTo({ url: '/pages/editRoute/index' });
        break;
      default:
        break;
    }
  };

  /**
   * 模拟器缩放监听不工作
   * @param e
   */
  const regionchange = (e) => {
    // console.log('regionchange',e);

    const {
      type,
      detail: { region },
    } = e;
    if (type !== 'end') {
      return;
    }
    currentRegion.value = region;
    markers.value = appStore.cameraMarkers.filter((marker) =>
      isMarkerInRegion(marker, region.northeast, region.southwest)
    );
  };
  const onTapPoi = (e) => {
    console.log('onTapPoi:', e);
  };

  const onCallouttap = (e) => {
    console.log('onCallouttap:', e);
  };

  const onMarkertap = (e) => {
    console.log('markertap:', e);

    const marker = appStore.cameraMarkers[e.markerId];
    Taro.navigateTo({
      url: `/pages/cameraDetail/index?marker=${JSON.stringify(marker)}`,
    });
  };

  const getUserLocation = async () => {
    try {
      await getAuthoration('scope.userLocation');
      Taro.getLocation({
        type: 'gcj02',
        success(res) {
          console.log('getLocation, ', res);
          centerLocation.value = {
            longitude: res.longitude,
            latitude: res.latitude,
          };
          appStore.currentLongitude = res.longitude;
          appStore.currentLatitude = res.latitude;
        },
      });
    } catch (error) {
      console.log(error);
      Taro.showModal({
        title: '请授权定位',
        content: '方便更好的显示附近点位信息',
        showCancel: false,
      });
    }
  };

  const getCameraMarkers = async () => {
    Taro.showLoading({ title: '加载中' });
    await setupAllCameraPois();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tabbarList.value.find((item) => item.name === 'navigate')!.value =
      appStore.cameraMarkers.length;

    if (currentRegion.value) {
      const region = currentRegion.value;
      markers.value = appStore.cameraMarkers.filter((marker) =>
        isMarkerInRegion(marker, region.northeast, region.southwest)
      );
    }

    // console.log('appStore.cameraMarkers: ', appStore.cameraMarkers);
    Taro.hideLoading();
  };

  const setupData = async () => {
    getCameraMarkers();
    getUserLocation();
    setupSetting();
    setupNotifications();
  };

  onMounted(async () => {
    setupData();
  });
</script>

<style lang="scss"></style>
