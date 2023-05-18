import webExtension from '@samrum/vite-plugin-web-extension';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { getManifest } from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const manifestVersion = Number(env.MANIFEST_VERSION);
  const isFirefox =
    env.VITE_BUILD_FOR_FIREFOX === 'true' || env.VITE_BUILD_FOR_FIREFOX === '1';

  return {
    plugins: [
      react(),
      webExtension({
        manifest: getManifest(manifestVersion, isFirefox),
        useDynamicUrlContentScripts: !isFirefox,
      }),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  };
});
