import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import {
  Multisig,
  Tx,
  CombineSignatures,
} from '@/pages';
import App from '@/App.vue';

const app = createApp(App);
app.use(createPinia());

const routes = [
  { path: '/', component: {} },
  { path: '/multisig', component: Multisig },
  { path: '/tx', component: Tx },
  { path: '/combine-signatures', component: CombineSignatures },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(router);

app.mount('#app');
