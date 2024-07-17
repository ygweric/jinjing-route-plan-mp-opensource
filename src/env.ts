import { jingdu, xiyiqu } from './mock/address';
import common from '../env.mjs';
import { AMAP_KEY,AES } from '../.private-keys';

const { server, mode } = common;

const serverMapping = {
  local: 'http://127.0.0.1:3000',
  test: 'https://api-test.domain.com',
  prod: 'https://api.domain.com',
};

// 高德最对支持32个避让点
const MAX_AVOID_POINT_COUTN = 32;

// 最大尝试次数，避免无限制的请求规划下去， 具体数量以后可以再思考
const MAX_TRY_COUTN = 30;

const routeColors = [
  '#aa0000',
  '#00aa00',
  '#0000aa',
  '#aaaa00', // yellow
  '#00aaaa', // cyan
  '#aa00aa', // ping
  // '#000000',
];

/* 和server同构 */
export const CameraType = {
  inner6MaybePos: 'inner6MaybePos', // 1
  inner6Actived: 'inner6Actived', // 2
  inner6MaybeActive: 'inner6MaybeActive', // 4
  outer6: 'outer6', // 6
  unknow: 'unknow', // others
};

export const CIPHERS = {
  AES,
  // AMAP_KEY: '你的高德key',
  AMAP_KEY,
};

export const Ad = {
  RewardedVideoId: '你的广告视频激励id',
};

const defaultFromAddress = xiyiqu;
const defaultToAddress = jingdu;

const env = {
  host: serverMapping[server],
  server,
  isProd: mode === 'prod',
  routeColors,
  defaultFromAddress,
  defaultToAddress,
  MAX_AVOID_POINT_COUTN,
  MAX_TRY_COUTN,
};
export default env;
