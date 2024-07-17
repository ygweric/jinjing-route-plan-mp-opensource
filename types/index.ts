export type Location = {
  longitude: number;
  latitude: number;
  name?: string;
};
export type CameraLocationData = Location & {
  globalIndex?: number; // 在"appStore.cameraMarkers"中的index，方便查找
};

export type ToastType = 'text' | 'success' | 'fail' | 'warn' | 'loading';

export type RoutePointType = {
  name: string; // 望京SOHO
  location: string; // "116.480639,39.996356"
};

export type RouteType = {
  name: string;
  from: RoutePointType;
  to: RoutePointType;
};
