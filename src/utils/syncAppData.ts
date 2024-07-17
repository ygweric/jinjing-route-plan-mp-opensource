import env from '@/src/env';
import dayjs from 'dayjs';
import { useAppStore } from '../store/index';
import { fetchData } from './api';

/**
 * 获取setting，如果已经存在，就不获取了
 */
export const setupSetting = async () => {
  const appStore = useAppStore();
  if (appStore.setting) {
    return;
  }
  const res = await fetchData(`${env.host}/setting`, 'get');

  console.log(res);
  appStore.setting = res.data;
};

/**
 * 获取setting，如果已经存在，就不获取了
 */
export const setupNotifications = async () => {
  const appStore = useAppStore();
  if (appStore.notifications) {
    return;
  }
  const res = await fetchData(`${env.host}/config-setting`, 'get');

  console.log(res);
  const notifications = (res.notifications || [])
    .filter((notification) => {
      if (
        notification.expiredDate &&
        dayjs(notification.expiredDate).valueOf() < Date.now()
      ) {
        return false;
      }
      return true;
    })
    .map((notification) => {
      const timePlaceHolder = '[time]';
      if (!notification.content.includes(timePlaceHolder)) {
        return notification;
      }

      const expiredDate = dayjs(notification.expiredDate).format(
        'MM月DD日HH点mm分'
      );
      return {
        ...notification,
        content: notification.content.replace(timePlaceHolder, expiredDate),
      };
    });

  appStore.notifications = notifications;
};

/**
 * 同步摄像头数据
 */
export const setupAllCameraPois = async () => {
  const appStore = useAppStore();
  if (appStore.cameraMarkers.length > 0) {
    return;
  }

  const res = await fetchData(`${env.host}/allCamera`, 'get');
  if (res.code !== 0) {
    console.error(res.msg);
    return;
  }

  const pois = res.data.data;
  // const pois = res.data.data.filter(poi=>poi.i==='4921');

  appStore.cameraMarkers = pois.map((poi, index) => {
    return {
      ...poi,
      iconPath: `/assets/images/poi/${poi.type}.png`,
      id: index,
      width: 30,
      height: 30,
    };
  });

  console.log(appStore.cameraMarkers);
};
