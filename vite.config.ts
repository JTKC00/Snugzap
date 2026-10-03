import { defineConfig } from 'vite'
import { snugzapSitePlugin } from './src/plugin.ts'
import { pageEntry, pages } from './src/site.ts'

export default defineConfig({
  appType: 'mpa',
  plugins: [snugzapSitePlugin()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        ...Object.fromEntries(pages.map((page) => [page.id, pageEntry(page)])),
        notFound: '404.html',
      },
    },
  },
})
