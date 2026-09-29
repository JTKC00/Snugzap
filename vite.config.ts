import { defineConfig, loadEnv } from 'vite'
import { renderHomepage, renderNotFound } from './src/render.ts'
import { fillTemplate, isIndexableBuild, renderHead, renderHeaders, renderRobots, renderSitemap } from './src/seo.ts'

export default defineConfig(({ mode }) => {
  // Vite gives process-provided variables priority. Read only the two deployment
  // keys; nothing is injected into client code. Post-build checks independently
  // verify the result against the actual process CONTEXT.
  const environment = loadEnv(mode, '.', ['CONTEXT', 'NETLIFY'])
  const buildIndexable = isIndexableBuild({ CONTEXT: environment.CONTEXT, NETLIFY: environment.NETLIFY })
  return {
    appType: 'mpa',
    plugins: [{
      name: 'snugzap-static-seo',
      transformIndexHtml: {
        order: 'pre',
        handler(html, context) {
          const indexable = !context.server && buildIndexable
          const notFound = context.filename.replaceAll('\\', '/').split('/').at(-1) === '404.html'
          return fillTemplate(html, renderHead(notFound ? 'not-found' : 'home', indexable),
            notFound ? renderNotFound() : renderHomepage())
        },
      },
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: renderRobots(buildIndexable) })
        this.emitFile({ type: 'asset', fileName: '_headers', source: renderHeaders(buildIndexable) })
        if (buildIndexable) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap() })
      },
    }],
    build: { rollupOptions: { input: ['index.html', '404.html'] } },
  }
})
