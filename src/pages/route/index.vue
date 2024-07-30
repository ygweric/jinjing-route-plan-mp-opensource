<template>
  <view class="page-con w-screen h-screen bg-white">
    <map
      id="map"
      style="width: 100%; height: 100%"
      :longitude="longitude"
      :latitude="latitude"
      scale="14"
      :markers="markers"
      :polyline="polyline"
      :show-location="true"
      @regionchange="regionchange"
      @markertap="markertap"
    ></map>
    <nut-button
      v-if="matchedMarkers.length > 0 && routeFindStatus === 'toFind'"
      type="primary"
      class="!absolute right-2 top-40"
      @click="loopFindFreePathWithAd"
    >
      <template #icon>
        <IconFont size="30" name="/assets/images/menu/ai_nav.png"></IconFont>
      </template>
      智能避让
    </nut-button>
    <nut-button
      v-if="routeFindStatus === 'findSuccess'"
      color="#7232dd"
      class="!absolute right-2 top-60"
      @click="showRightRoutePaths = true"
    >
      <template #icon>
        <IconFont
          size="30"
          name="/assets/images/menu/route_detail.png"
        ></IconFont>
      </template>
      线路详情
    </nut-button>
    <nut-button
      openType="share"
      v-if="routeFindStatus === 'findSuccess'"
      type="primary"
      class="!absolute right-2 top-80"
    >
      <template #icon>
        <IconFont size="20" name="/assets/images/menu/share.png"></IconFont>
      </template>
      分享线路
    </nut-button>

    <nut-popup
      v-model:visible="showRightRoutePaths"
      position="bottom"
      closeable
      :style="{ height: '80%' }"
    >
      <scroll-view :scroll-y="true" class="mt-4 mb-4 h-full">
        <view
          v-for="path in rightRoutePaths"
          :key="path.instruction"
          class="relative mt-2 mb-2 ml-4 mr-4"
        >
          <div class="text-gray-600 mb-4">{{ path.instruction }}</div>
          <div class="h-[1px] bg-slate-200 mb-2"></div>
        </view>
      </scroll-view>
    </nut-popup>
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
      >
        <template #icon>
          <img :src="item.icon" alt="" />
        </template>
      </nut-tabbar-item>
    </nut-tabbar>
  </view>
</template>

<script lang="ts" setup>
  import env, { Ad, CameraType, CIPHERS } from '@/src/env';
  import { useAppStore } from '@/src/store';
  import { getMongoRouteCachedName } from '@/src/utils/cache';
  import { isMarkerInRegion } from '@/src/utils/geo';
  import { setupAllCameraPois } from '@/src/utils/syncAppData';
  import { fetchData } from '@/utils/api';
  import { IconFont } from '@nutui/icons-vue-taro';
  import Taro, { useShareAppMessage } from '@tarojs/taro';
  import { CameraLocationData, Location } from 'types';
  import { computed, onMounted, ref } from 'vue';

  const appStore = useAppStore();

  // 地图上画线的二位数组
  const polylinePoints = ref<Location[][]>([]);
  // 存储所有点的一维数组
  const polylineFlatPoints = ref<Location[]>([]);
  // 避让点，是点位
  const avoidPoints = ref<Location[]>([]);

  // 线路对应的点位
  const matchedPois = ref<CameraLocationData[]>([]);
  const matchedMarkers = ref<Location[]>([]);
  const unmatchedPois = ref<CameraLocationData[]>([]);
  const unmatchedMarkers = ref<Location[]>([]);

  // 待查找、查找成功、查找失败
  const routeFindStatus = ref<'toFind' | 'findSuccess' | 'findFail'>('toFind');

  // 正确线路信息
  const rightRoutePaths = ref<{ instruction: string }[]>([]);
  const showRightRoutePaths = ref(false);

  const mongoCacheRouteName = ref('');

  /**
   * 是否是分享线路模式
   */
  const isSharedRouteMode = ref(false);

  const longitude = ref(appStore.currentLongitude);
  const latitude = ref(appStore.currentLatitude);

  const fromAddress = ref<any>();
  const toAddress = ref<any>();

  let currentRoute = {} as any;
  let videoAd: any;

  const markers = ref<any[]>([]);
  const polyline = ref<any[]>([]);

  const mapCtx = Taro.createMapContext('map');

  const activeTabbarName = ref('setting');
  const basicTabbarList = [
    {
      title: '错误反馈',
      icon: '/assets/images/menu/errorReport.png',
      name: 'errorReport',
    },
    {
      title: '设置',
      icon: '/assets/images/menu/setting.png',
      name: 'setting',
    },
    {
      title: '加微信',
      icon: '/assets/images/menu/addWechat.png',
      name: 'addWechat',
    },
  ];

  const extraTabBarItemsAfterSmartRoute = [
    {
      title: '重新规划',
      icon: '/assets/images/menu/navigate.png',
      name: 'forceReRoute',
    },
  ];

  const tabbarList = computed(() => {
    return [
      ...basicTabbarList,
      ...(routeFindStatus.value === 'toFind'
        ? []
        : extraTabBarItemsAfterSmartRoute),
    ];
  });

  const getFromToMarkers = () => {
    if (!fromAddress.value || !toAddress.value) {
      // 分享线路时候这两个是空的，懒得处理了
      return [];
    }
    return [
      {
        title: fromAddress.value.name,
        longitude: fromAddress.value.longitude,
        latitude: fromAddress.value.latitude,
        iconPath: `/assets/images/poi/from_place.png`,
        id: 100001,
        width: 40,
        height: 40,
      },
      {
        title: toAddress.value.name,
        longitude: toAddress.value.longitude,
        latitude: toAddress.value.latitude,
        iconPath: `/assets/images/poi/to_place.png`,
        id: 100002,
        width: 40,
        height: 40,
      },
    ];
  };

  const regionchange = (e) => {
    if (routeFindStatus.value === 'toFind') {
      return;
    }
    const {
      type,
      detail: { region },
    } = e;
    if (type !== 'end') {
      return;
    }
    markers.value = [
      ...matchedMarkers.value,
      ...unmatchedMarkers.value.filter((marker) =>
        isMarkerInRegion(marker, region.northeast, region.southwest)
      ),
      ...getFromToMarkers(),
    ];
  };
  const markertap = (e) => {
    console.log('markertap:', e.detail.markerId);

    const marker = appStore.cameraMarkers[e.markerId];
    Taro.navigateTo({
      url: `/pages/cameraDetail/index?marker=${JSON.stringify(marker)}`,
    });
  };

  const getPologyonFromPoint = (point: Location) => {
    const precision = 10;
    const diffGeo = (precision * 0.00001) / 2;
    const { longitude, latitude } = point;
    return [
      { longitude: longitude - diffGeo, latitude: latitude - diffGeo },
      { longitude: longitude + diffGeo, latitude: latitude + diffGeo },
      { longitude: longitude - diffGeo, latitude: latitude + diffGeo },
      { longitude: longitude + diffGeo, latitude: latitude - diffGeo },
    ];
  };

  /**
   * chatGPT 提供的算法
   * @param point
   * @param polygon
   */
  function isPointInPolygon(point: Location, polygon: Location[]) {
    let x = point.latitude; // 维度-x
    let y = point.longitude; // 经度-y
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].latitude;
      let yi = polygon[i].longitude;
      let xj = polygon[j].latitude;
      let yj = polygon[j].longitude;
      let intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const showMatchedMarkers = () => {
    matchedMarkers.value = matchedPois.value.map((poi) => ({
      iconPath: `/assets/images/poi/matched.png`,
      id: poi.globalIndex,
      longitude: poi.longitude,
      latitude: poi.latitude,
      width: 30,
      height: 30,
    }));
    unmatchedMarkers.value = unmatchedPois.value.map((poi) => ({
      iconPath: `/assets/images/poi/unmatched.png`,
      id: poi.globalIndex,
      longitude: poi.longitude,
      latitude: poi.latitude,
      width: 20,
      height: 20,
    }));

    markers.value = [
      ...matchedMarkers.value,
      ...unmatchedMarkers.value,
      ...getFromToMarkers(),
    ];
  };

  const getMatchedPois = () => {
    matchedPois.value = [];
    unmatchedPois.value = [];

    // points: polylineFlatPoints.value.map(({ longitude, latitude }) => ({ longitude: longitude + diffGeo, latitude: latitude + diffGeo })),

    //  ---------------------------------- 偏移说明 --- begin --------------------------------
    // 经纬度的偏差,精度是1米，则左右两边个加减0.5米
    // * 没有宽度的polygon加上geoDiff的宽度, 是由原来线条的（正序+偏移）+（倒序-偏移） 构成
    // * 1米大约对应纬度上的0.000009度，经度上的0.000011度。
    // * 所以大概是1米~0.00001 => 小数后5位
    // * 所以普通的经纬度保持6位(cm)的精度是可以接受的

    const precision = 10;
    const diffGeo = (precision * 0.00001) / 2;
    const polylineFlatPointsWithWidth = [
      ...polylineFlatPoints.value.map(({ longitude, latitude }) => ({
        longitude: longitude + diffGeo,
        latitude: latitude + diffGeo,
      })),
      ...polylineFlatPoints.value
        .map(({ longitude, latitude }) => ({
          longitude: longitude - diffGeo,
          latitude: latitude - diffGeo,
        }))
        .reverse(),
    ];

    // 显示线路的polygon实体，判断点会否在改多边形中，方便调试
    const polylineFlatPointsWithWidthPolygons = [
      {
        points: polylineFlatPointsWithWidth.slice(
          0,
          polylineFlatPointsWithWidth.length / 2
        ),
        color: '#ff0000',
        width: 3,
      },
      {
        points: polylineFlatPointsWithWidth.slice(
          polylineFlatPointsWithWidth.length / 2,
          polylineFlatPointsWithWidth.length
        ),
        color: '#0000ff',
        width: 3,
      },
    ];
    polyline.value = [
      ...polyline.value,
      ...(env.isProd ? [] : polylineFlatPointsWithWidthPolygons),
    ];

    // console.log('polylineFlatPointsWithWidth: ', polylineFlatPointsWithWidth);
    //  ---------------------------------- 偏移说明 --- end --------------------------------

    for (let i = 0; i < appStore.cameraMarkers.length; i++) {
      const poi = appStore.cameraMarkers[i];
      if (
        poi.type !== CameraType.outer6 &&
        isPointInPolygon(poi, polylineFlatPointsWithWidth)
      ) {
        matchedPois.value.push({ ...poi, globalIndex: i });
      } else {
        unmatchedPois.value.push({ ...poi, globalIndex: i });
      }
    }
    console.log('matchedPois.value: ', matchedPois.value);
    console.log('unmatchedPois.value: ', unmatchedPois.value);
  };

  const setupRoutePolygon = async (route: any) => {
    let pointsList: any[] = route.paths[0].steps.map((item) =>
      item.tmcs.map((tmc) => tmc.tmc_polyline)
    ) as any[][];

    // console.log('1',pointsList);
    pointsList = pointsList.flat();
    // console.log('2',pointsList);

    pointsList = pointsList.map((points) => points.split(';'));
    // console.log('3',pointsList);

    pointsList = pointsList.map((points) =>
      points
        .map((point) => point.split(','))
        .map(([longitude, latitude]) => ({
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        }))
    );

    console.log('5', pointsList);

    polylinePoints.value = pointsList;
    polylineFlatPoints.value = pointsList.flat();
    console.log('polylineFlatPoints: ', polylineFlatPoints.value);

    polyline.value = pointsList.map((points, index) => ({
      points,
      color: env.routeColors[index % env.routeColors.length],
      width: 5,
    }));

    // 测试用，验证flat后的数组和flat之前线路是一致的
    const diffGeo = 0.0;
    const flatedPointsPolygon = {
      points: polylineFlatPoints.value.map(({ longitude, latitude }) => ({
        longitude: longitude + diffGeo,
        latitude: latitude + diffGeo,
      })),
      color: '#1d4ed8cc',
      width: 5,
    };
    console.log('flatedPointsPolygon: ', flatedPointsPolygon);

    polyline.value = [...polyline.value, flatedPointsPolygon];

    // includePoints不稳定，还是会被重新定位到默认中心点
    mapCtx.includePoints({
      points: polylineFlatPoints.value,
      padding: [36, 36, 10, 36],
    });
  };
  const requestRoute = async () => {
    console.log('fromAddress.value: ', JSON.stringify(fromAddress.value));
    console.log('toAddress.value: ', JSON.stringify(toAddress.value));

    const avoidpolygonsString = avoidPoints.value
      .map((point) => {
        const polygon = getPologyonFromPoint(point);
        return polygon.map((p) => `${p.longitude},${p.latitude}`).join(';');
      })
      .join('|');

    const data = {
      fromName: fromAddress.value.name, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      fromGeo: fromAddress.value.location, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      toName: toAddress.value.name, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      toGeo: toAddress.value.location, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      avoidpolygons: avoidpolygonsString,
    };

    const amapData = {
      origin: data.fromGeo,
      destination: data.toGeo,
      avoidpolygons: data.avoidpolygons,
      key: CIPHERS.AMAP_KEY,
      show_fields: 'cost,tmcs',
    };

    mongoCacheRouteName.value = getMongoRouteCachedName(data);

    const res = await fetchData(
      `https://restapi.amap.com/v5/direction/driving`,
      'post',
      amapData,
      { 'Content-Type': 'application/x-www-form-urlencoded' }
    );

    if (res.infocode !== '10000') {
      Taro.hideLoading();
      Taro.showModal({
        title: '出错了',
        content: '我们会尽快排查，请您稍后重试',
        showCancel: false,
      });
      return;
    }

    currentRoute = res;
  };

  /**
   * @param cacheRouteId  cacheRouteId=null 表示已经是从mongodb中获取的值了，不需要再标记线路
   */
  const markRouteSuccess = async (cacheRouteId) => {
    await fetchData(`${env.host}/markRouteSuccess`, 'get', {
      cacheRouteId,
    });
  };

  const loopFindFreePath = async () => {
    rightRoutePaths.value = [];

    for (let i = 0; i < env.MAX_TRY_COUTN; i++) {
      Taro.showToast({
        title: `第${i + 1}次尝试, 添加${
          avoidPoints.value.length
        }个摄像头躲避点`,
        icon: 'none',
        duration: 2000,
      });

      Taro.showLoading({ title: '加载中' });
      // eslint-disable-next-line no-await-in-loop
      await requestRoute();
      // eslint-disable-next-line no-await-in-loop
      await setupRoutePolygon(currentRoute.route);
      getMatchedPois();
      Taro.hideLoading();

      

      avoidPoints.value = [...avoidPoints.value, ...matchedPois.value];

      console.log(`current avoidPoints: `, avoidPoints.value);

      if (matchedPois.value.length === 0) {
        console.log('success find free route');
        Taro.showModal({
          title: '规划成功',
          content: '最好二次确认线路是否合适',
          showCancel: false,
        });
        rightRoutePaths.value = currentRoute.route.paths[0].steps;
        currentRoute.cacheRouteId &&
          markRouteSuccess(currentRoute.cacheRouteId);
        showMatchedMarkers(); // 查找结束后才添加markers，节省性能
        routeFindStatus.value = 'findSuccess';
        return;
      }
      if (avoidPoints.value.length > env.MAX_AVOID_POINT_COUTN) {
        console.log(`规避点>${env.MAX_AVOID_POINT_COUTN}个，规划失败`);
        Taro.showModal({
          title: '规划失败',
          content: `规避点>${env.MAX_AVOID_POINT_COUTN}个`,
          showCancel: false,
        });
        showMatchedMarkers(); // 查找结束后才添加markers，节省性能
        routeFindStatus.value = 'findFail';
        return;
      }

      console.log(
        `time: ${i + 1} with ${matchedPois.value.length} matched pois`
      );
    }

    showMatchedMarkers(); // 查找结束后才添加markers，节省性能
    routeFindStatus.value = 'findFail';
    Taro.showModal({
      title: '我努力过了~',
      content: '我失败了，请添加中间点位，缩短距离，重新规划',
      showCancel: false,
    });
  };

  const loopFindFreePathWithAd = async () => {
    if (!env.isProd || !videoAd || appStore.setting?.showVideoAd !== 'true') {
      loopFindFreePath();
      return;
    }
    Taro.showModal({
      title: '需要观看完广告才能智能规划线路哦',
      content:
        '小程序的维护需要服务器资源，请观看完广告获取激励支持我们，万分感谢',
      // showCancel: false,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          videoAd.show().catch(() => {
            // 失败重试
            videoAd
              .load()
              .then(() => videoAd.show())
              .catch((err) => {
                console.error('激励视频 广告显示失败', err);
              });
          });
          videoAd.onLoad(() => {
            console.log('videoAd.onLoad');
          });
          videoAd.onClose((res) => {
            console.log('videoAd.onClose', res);
            if (res.isEnded) {
              loopFindFreePath();
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      },
    });
  };
  const showGeneralPath = async () => {
    Taro.showLoading({ title: '加载中' });
    avoidPoints.value = [];
    // eslint-disable-next-line no-await-in-loop
    await requestRoute();
    // eslint-disable-next-line no-await-in-loop
    await setupRoutePolygon(currentRoute.route);
    getMatchedPois();
    showMatchedMarkers(); // 查找结束后才添加markers，节省性能
    Taro.hideLoading();
    avoidPoints.value = [...matchedPois.value]; // 这里直接记录下avoidPoints，后面智能避让时候直接传avoidPoints了，不需要从头开始
    if (matchedPois.value.length === 0) {
      Taro.showModal({
        title: '途中没有经过摄像头',
        content: '最好二次确认',
        showCancel: false,
      });
    } else {
      Taro.showToast({
        title: `途中经过${matchedPois.value.length}个摄像头点位， 请使用“智能避让”功能避让摄像头`,
        icon: 'none',
        duration: 8000,
      });
    }
  };

  const forceReRoute = async () => {
    const data = {
      fromName: fromAddress.value.name,
      fromGeo: fromAddress.value.location,
      toName: toAddress.value.name,
      toGeo: toAddress.value.location,
    };

    const res = await fetchData(
      `${env.host}/forceExpireRourte`,
      'get',
      data
    );
    if (res.code !== 0) {
      Taro.showToast({
        title: `缓存线路更新失败! 请重试，或者替换为相近起点和终点`,
        icon: 'none',
        duration: 4000,
      });
      return;
    }
    avoidPoints.value = [];
    loopFindFreePathWithAd();
  };

  const onTabSwitch = (_: Record<string, unknown>, name: string) => {
    switch (name) {
      case 'point_desc':
        Taro.navigateTo({
          url: `/pages/web/index?title=点位说明&url=${appStore.setting?.point_desc}`,
        });
        break;
      case 'errorReport':
        Taro.navigateTo({ url: '/pages/setting/index' });
        break;
      case 'setting':
        Taro.navigateTo({ url: '/pages/setting/index' });
        break;
      case 'addWechat':
        Taro.navigateTo({ url: '/pages/setting/index' });
        break;
      case 'forceReRoute':
        Taro.showModal({
          title: '当前路线有问题吗',
          content:
            '重新规划新路会重新请求导航接口，查找合适线路，当线路有问题时候可以用',
          confirmText: '重新规划',
          success(res) {
            if (res.confirm) {
              forceReRoute();
            }
          },
        });
        break;
      default:
        break;
    }
  };

  const setupFromToAddress = () => {
    const fromAddressStr = Taro.getCurrentInstance().router?.params
      .fromAddressStr as string;
    const toAddressStr = Taro.getCurrentInstance().router?.params
      .toAddressStr as string;

    fromAddress.value = JSON.parse(fromAddressStr);
    fromAddress.value = {
      ...fromAddress.value,
      longitude: parseFloat(fromAddress.value.location.split(',')[0]),
      latitude: parseFloat(fromAddress.value.location.split(',')[1]),
    };
    toAddress.value = JSON.parse(toAddressStr);
    toAddress.value = {
      ...toAddress.value,
      longitude: parseFloat(toAddress.value.location.split(',')[0]),
      latitude: parseFloat(toAddress.value.location.split(',')[1]),
    };
    Taro.setNavigationBarTitle({
      title: `${fromAddress.value.name} - ${toAddress.value.name}`,
    });

    longitude.value =
      (fromAddress.value.longitude + toAddress.value.longitude) / 2;
    latitude.value =
      (fromAddress.value.latitude + toAddress.value.latitude) / 2;
  };

  const getSharedRoute = async (name: string) => {
    const res = await fetchData(
      `${env.host}/sharedRoute/${name}`,
      'get'
    );
    if (res.code !== 0) {
      console.error(res.msg);
      return;
    }

    currentRoute = { route: res.data.routes.route };
  };

  const setupData = async () => {
    Taro.showLoading({ title: '加载中' });
    await setupAllCameraPois();
    Taro.hideLoading();

    const sharedRouteName = Taro.getCurrentInstance().router?.params
      .sharedRouteName as string;
    isSharedRouteMode.value = !!sharedRouteName;

    if (!isSharedRouteMode.value) {
      setupFromToAddress();
      showGeneralPath();
    } else {
      // 天通西苑一区_116.409_40.065-北京京都儿童医院急诊_116.357_40.080
      const [from, to] = sharedRouteName.split('-');
      const formInfo = from.split('_');
      const toInfo = to.split('_');
      fromAddress.value = {
        name: formInfo[0],
        longitude: formInfo[1],
        latitude: formInfo[2],
        location: `${formInfo[1]},${formInfo[2]}`,
      };
      toAddress.value = {
        name: toInfo[0],
        longitude: toInfo[1],
        latitude: toInfo[2],
        location: `${toInfo[1]},${toInfo[2]}`,
      };

      Taro.showLoading({ title: '加载中' });
      await getSharedRoute(sharedRouteName);
      Taro.hideLoading();
      if (!currentRoute || !currentRoute.route) {
        Taro.showModal({
          title: '分享的线路丢失了',
          content: `请重新规划线路`,
          showCancel: false,
        });
        return;
      }
      await setupRoutePolygon(currentRoute.route);
      getMatchedPois();
      showMatchedMarkers(); // 查找结束后才添加markers，节省性能
    }

    // 在页面onLoad回调事件中创建激励视频广告实例
    if (Taro.createRewardedVideoAd) {
      videoAd = Taro.createRewardedVideoAd({
        adUnitId: Ad.RewardedVideoId,
      });
      videoAd.onError((err) => {
        console.error('激励视频光告加载失败', err);
      });
    }

    // 测试定位代码
    // const locationChangeFn = function (res) {
    //   console.log('location change', res);
    // };
    // Taro.onLocationChange(locationChangeFn);
    // Taro.offLocationChange(locationChangeFn);
  };

  useShareAppMessage((res) => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
    }
    console.log(`sharedRouteName=${mongoCacheRouteName.value}`);

    return {
      title: `${fromAddress.value.name}-${toAddress.value.name} 线路分享`,
      path: `/pages/route/index?sharedRouteName=${mongoCacheRouteName.value}`,
    };
  });

  onMounted(async () => {
    setupData();
  });
</script>

<style lang="scss"></style>
