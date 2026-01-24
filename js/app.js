import { store } from './store.js';
import { initUI } from './ui.js';
import { initRouter } from './router.js';
import { initSidebar } from './sidebar.js';

initRouter();
initUI(store);
initSidebar();
