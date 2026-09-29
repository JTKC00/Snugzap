import { existsSync, readFileSync, statSync } from 'node:fs'
import type { ServerResponse } from 'node:http'
import path from 'node:path'
import type { Connect, Plugin, PreviewServer } from 'vite'
import { renderDocument, renderRobots, renderRobotsHeader, renderSitemap, type RenderedPage } from './render.ts'
import { resolveDeployContext, type DeployContext } from './site.ts'

const currentContext = (): DeployContext => resolveDeployContext(process.env.CONTEXT)

const pageFromFilename = (filename: string): RenderedPage =>
  filename.endsWith(`${path.sep}404.html`) || filename.endsWith('/404.html') ? 'not-found' : 'home'

const send = (response: ServerResponse, status: number, type: string, body: string): void => {
  response.statusCode = status
  response.setHeader('Content-Type', type)
  response.end(body)
}

const robotsTagValue = (headers: string | null): string | null =>
  headers?.match(/^ {2}X-Robots-Tag:\s*(.+)$/m)?.[1]?.trim() ?? null

const applyRobotsHeader = (response: ServerResponse, context: DeployContext): void => {
  const value = robotsTagValue(renderRobotsHeader(context))

  if (value) response.setHeader('X-Robots-Tag', value)
}

const applyBuiltRobotsHeader = (response: ServerResponse, outDir: string): void => {
  const headersFile = path.join(outDir, '_headers')

  if (!existsSync(headersFile)) return

  const value = robotsTagValue(readFileSync(headersFile, 'utf8'))

  if (value) response.setHeader('X-Robots-Tag', value)
}

const outputDir = (root: string, outDir: string): string => (path.isAbsolute(outDir) ? outDir : path.resolve(root, outDir))

const isInside = (root: string, candidate: string): boolean => {
  const relative = path.relative(root, candidate)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

const pathname = (request: Connect.IncomingMessage): string => (request.url ?? '/').split('?')[0] ?? '/'

const devNotFound: Connect.NextHandleFunction = (request, response, next) => {
  if (response.headersSent || response.writableEnded || (request.method !== 'GET' && request.method !== 'HEAD')) {
    next()
    return
  }

  const url = pathname(request)
  const context = currentContext()

  if (url === '/robots.txt') {
    applyRobotsHeader(response, context)
    send(response, 200, 'text/plain; charset=utf-8', renderRobots(context))
    return
  }

  if (url === '/sitemap.xml') {
    applyRobotsHeader(response, context)
    send(response, 200, 'application/xml; charset=utf-8', renderSitemap())
    return
  }

  const isAsset =
    url === '/' ||
    url === '/index.html' ||
    url.startsWith('/@') ||
    url.startsWith('/__vite') ||
    url.startsWith('/src/') ||
    url.startsWith('/node_modules/') ||
    url.includes('.')

  if (isAsset) {
    next()
    return
  }

  applyRobotsHeader(response, context)
  send(response, 404, 'text/html; charset=utf-8', renderDocument('not-found', context))
}

const previewNotFound =
  (server: PreviewServer): Connect.NextHandleFunction =>
  (request, response, next) => {
    if (response.headersSent || response.writableEnded || (request.method !== 'GET' && request.method !== 'HEAD')) {
      next()
      return
    }

    const url = pathname(request)

    if (url === '/' || url === '/index.html') {
      next()
      return
    }

    const outDir = outputDir(server.config.root, server.config.build.outDir)
    let decoded: string

    try {
      decoded = decodeURIComponent(url)
    } catch {
      next()
      return
    }

    const candidate = path.resolve(outDir, decoded.replace(/^\/+/, ''))

    if (isInside(outDir, candidate) && existsSync(candidate) && statSync(candidate).isFile()) {
      next()
      return
    }

    const notFound = path.join(outDir, '404.html')

    if (!existsSync(notFound)) {
      next()
      return
    }

    send(response, 404, 'text/html; charset=utf-8', readFileSync(notFound, 'utf8'))
  }

export const snugzapSitePlugin = (): Plugin => ({
  name: 'snugzap-static-site',
  config() {
    return {
      appType: 'mpa',
      build: {
        emptyOutDir: true,
      },
    }
  },
  transformIndexHtml: {
    order: 'pre',
    handler(_html, ctx) {
      return renderDocument(pageFromFilename(ctx.filename), currentContext())
    },
  },
  generateBundle() {
    const context = currentContext()
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: renderRobots(context) })
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap() })

    const headers = renderRobotsHeader(context)

    if (headers) {
      this.emitFile({ type: 'asset', fileName: '_headers', source: headers })
    }
  },
  configureServer(server) {
    return () => {
      server.middlewares.use(devNotFound)
    }
  },
  configurePreviewServer(server) {
    server.middlewares.use((_request, response, next) => {
      applyBuiltRobotsHeader(response, outputDir(server.config.root, server.config.build.outDir))
      next()
    })

    return () => {
      server.middlewares.use(previewNotFound(server))
    }
  },
})
