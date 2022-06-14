import { createRouter, createWebHashHistory, RouterScrollBehavior } from 'vue-router';
import {
  Home,
  CreateMultisig,
  CreateTx,
  SignTx,
  CombineSignaturesAndBroadcastTx,
} from '@/pages';

export const routes = [
  {
    name: 'Home',
    path: '/',
    component: Home,
  },
  {
    name: 'Create multisig wallet',
    path: '/create-multisig',
    component: CreateMultisig,
  },
  {
    name: 'Create transaction',
    path: '/create-tx',
    component: CreateTx,
  },
  {
    name: 'Sign transaction',
    path: '/sign',
    component: SignTx,
  },
  {
    name: 'Combine signatures',
    path: '/combine',
    component: CombineSignaturesAndBroadcastTx,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
