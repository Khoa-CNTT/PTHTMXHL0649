import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_APP_PORT),
    },
    resolve: {
      alias: {
        '@assets': resolve(__dirname, 'src/assets'),
        '@components': resolve(__dirname, 'src/components'),
        '@lib': resolve(__dirname, 'src/lib'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@routers': resolve(__dirname, 'src/routers'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@_types': resolve(__dirname, 'src/types'),
        '@_mocks': resolve(__dirname, 'src/_mocks'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@layouts': resolve(__dirname, 'src/layouts'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@interfaces': resolve(__dirname, 'src/interfaces'),
        '@services': resolve(__dirname, 'src/services'),
        '@redux': resolve(__dirname, 'src/redux'),
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});
