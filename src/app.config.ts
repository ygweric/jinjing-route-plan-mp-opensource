export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/route/index',
    'pages/editRoute/index',
    'pages/cameraDetail/index',
    'pages/cameraList/index',
    'pages/chooseLocation/index',
    'pages/setting/index',
    'pages/addWechat/index',
    'pages/description/index',
    'pages/web/index',
    //
  ],
  permission: {
    'scope.userLocation': {
      desc: '请授权定位方便更好的显示附近摄像头点位信息',
    },
  },
  requiredPrivateInfos: [
    'getLocation',
    'startLocationUpdate',
    'onLocationChange',
    //
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
});
