import { defineConfig } from 'vite'
import { snugzapSitePlugin } from './src/plugin.ts'

export default defineConfig({
  appType: 'mpa',
  plugins: [snugzapSitePlugin()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        notFound: '404.html',
      },
    },
  },
})
