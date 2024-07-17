import { createPinia } from 'pinia';
import useAppStore from './modules/app/index';

const pinia = createPinia();

export { useAppStore };
export default pinia;
