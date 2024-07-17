import { createApp } from 'vue';
import { IconFont } from '@nutui/icons-vue-taro';
import './app.less';
import store from './store';

const app = createApp({
  // onShow (options) {},
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
});
app.use(store);
app.use(IconFont as any);

export default app;
