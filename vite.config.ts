import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path';
import { RPC_ENDPOINT, WALLET_CONNECT_BRIDGE } from './src/config'

function getHtmlInjectParams() {
  const rpcURL = new URL(RPC_ENDPOINT);
  const rpcDomain = rpcURL.host;

  const walletConnectURL = new URL(WALLET_CONNECT_BRIDGE);
  const walletConnectDomain = walletConnectURL.host;

  const connectSrc = [
    rpcDomain,
    `wss://*.${walletConnectDomain}`,
    `wss://${walletConnectDomain}`,
  ].join(' ')

  return { connectSrc };
}

export default defineConfig({
  plugins: [
    vue(),
    basicSsl(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: getHtmlInjectParams(),
      },
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 31801,
    https: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
