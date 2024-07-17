import { defineStore } from 'pinia';
import { RoutePointType } from 'types';

interface AppState {
  [key: string]: any;

  // 116.415332 ,40.05987 lognde plaza
  // default is niao chao
  currentLongitude: number;
  currentLatitude: number;

  fromAddress?: RoutePointType;
  toAddress?: RoutePointType;
  setting: { [key: string]: string } | null;
  notifications:
    | {
        id: number;
        expiredDate: string | undefined;
        type: 'deploying' | 'newCamera';
        title: string | undefined;
        content: string;
      }[]
    | null;
}

const defaultAppState: AppState = {
  cameraMarkers: [],
  currentLongitude: 116.389181,
  currentLatitude: 40.019636,
  fromAddress: undefined,
  toAddress: undefined,
  setting: null,
  notifications: null,
};

const useAppStore = defineStore('app', {
  state: (): AppState => defaultAppState,
});

export default useAppStore;
