import Taro from '@tarojs/taro';

export const getAuthoration = async (scope: string) => {
  console.log('getAuthoration');

  return new Promise((resolve, reject) => {
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
    Taro.getSetting({
      success(res) {
        console.log(res);

        if (res.authSetting[scope]) {
          resolve(null);
        } else {
          Taro.authorize({
            scope,
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              resolve(null);
            },
            fail(err) {
              reject(err);
            },
          });
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
};
