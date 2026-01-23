import { store } from './store.js';
import { initUI } from './ui.js';
import { initRouter } from './router.js';

initRouter();
initUI(store);
