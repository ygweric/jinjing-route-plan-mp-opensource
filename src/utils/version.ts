import Taro from '@tarojs/taro';
import version from '../../version';

const { version: versionLocal } = version;

export const getVersion = () => {
  return Taro.getAccountInfoSync().miniProgram.version || versionLocal; // 线上小程序版本号仅支持在正式版小程序中获取，开发版和体验版中无法获取
};
