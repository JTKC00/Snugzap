import { defineConfig } from 'vite'
import { basename } from 'node:path'
import { renderHomepage, renderNotFound } from './src/render.ts'
import { fillTemplate, isIndexableBuild, renderHead, renderHeaders, renderRobots, renderSitemap } from './src/seo.ts'

export default defineConfig({
  appType: 'mpa',
  plugins: [{
    name: 'snugzap-static-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const indexable = !context.server && isIndexableBuild({ CONTEXT: process.env.CONTEXT, NETLIFY: process.env.NETLIFY })
        const notFound = basename(context.filename) === '404.html'
        return fillTemplate(html, renderHead(notFound ? 'not-found' : 'home', indexable),
          notFound ? renderNotFound() : renderHomepage())
      },
    },
    generateBundle() {
      const indexable = isIndexableBuild({ CONTEXT: process.env.CONTEXT, NETLIFY: process.env.NETLIFY })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: renderRobots(indexable) })
      this.emitFile({ type: 'asset', fileName: '_headers', source: renderHeaders(indexable) })
      if (indexable) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap() })
    },
  }],
  build: { rollupOptions: { input: ['index.html', '404.html'] } },
})
