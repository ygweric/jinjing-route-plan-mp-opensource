const revertMap = (map) => {
  return Object.keys(map).reduce((pre, cur) => {
    pre[map[cur]] = cur;
    return pre;
  }, {});
};

export const cameraCharToKey = {
  i: 'cameraId',
  n: 'name',
  d: 'createDate',
  g: 'longitude',
  t: 'latitude',
  p: 'type',
  s: 'dataSource',
  u: 'useStatus',
};

export const cameraKeyToChar = revertMap(cameraCharToKey) as any;

export const cameraTypeCharToKey = {
  p: 'inner6MaybePos', // 1
  a: 'inner6Actived', // 2
  m: 'inner6MaybeActive', // 4
  o: 'outer6', // 6
  u: 'unknow', // others
};

export const cameraTypeKeyToChar = revertMap(cameraTypeCharToKey) as any;

export const dataSourceCharToKey = {
  s: 'syncData', // 进京365同步
  t: 'addByTwoWay', // 双向-手动添加
  r: 'addByUseReport', // 用户反馈-添加
};

export const dataSourceKeyToChar = revertMap(dataSourceCharToKey) as any;
