import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    resolve: {
      alias: [{ find: "~", replacement: resolve(__dirname, "./src") }]
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8888',
          changeOrigin: true,
        },
      },
    },
    define: {
      __REACT_QUERY_DEVTOOLS__: JSON.stringify(env.VITE_SHOW_REACT_QUERY_DEVTOOLS),
    }
  }
})


