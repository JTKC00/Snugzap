import { existsSync, readFileSync, statSync } from 'node:fs'
import type { ServerResponse } from 'node:http'
import path from 'node:path'
import type { Connect, Plugin, PreviewServer } from 'vite'
import { renderDocument, renderRobots, renderRobotsHeader, renderSitemap, type RenderedPage } from './render.ts'
import { pageEntry, pages, resolveDeployContext, type DeployContext } from './site.ts'

const currentContext = (): DeployContext => resolveDeployContext(process.env.CONTEXT)

export const pageFromFilename = (filename: string, root: string): RenderedPage => {
  const relative = path.relative(root, filename).split(path.sep).join('/')
  return pages.find((page) => pageEntry(page) === relative)?.id ?? 'not-found'
}

const isPagePath = (url: string): boolean =>
  pages.some((page) => url === page.path || url === `/${pageEntry(page)}`)

const redirectPage = (request: Connect.IncomingMessage, response: ServerResponse): boolean => {
  const url = pathname(request)
  const page = pages.find((page) => page.path !== '/' && url === page.path.slice(0, -1))
  if (!page) return false
  response.statusCode = 308
  response.setHeader('Location', `${page.path}${(request.url ?? '').slice(url.length)}`)
  response.end()
  return true
}

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
    isPagePath(url) ||
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

    if (isPagePath(url)) {
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

export const snugzapSitePlugin = (): Plugin => {
  let root = process.cwd()
  return {
    name: 'snugzap-static-site',
    configResolved(config) {
      root = config.root
    },
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
        return renderDocument(pageFromFilename(ctx.filename, root), currentContext())
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
      server.middlewares.use((request, response, next) => {
        applyRobotsHeader(response, currentContext())
        if (redirectPage(request, response)) return
        next()
      })
      return () => {
        server.middlewares.use(devNotFound)
      }
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        applyBuiltRobotsHeader(response, outputDir(server.config.root, server.config.build.outDir))
        if (redirectPage(request, response)) return
        next()
      })

      return () => {
        server.middlewares.use(previewNotFound(server))
      }
    },
  }
}
