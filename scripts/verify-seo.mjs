import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const jpeg = require('jpeg-js')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const viteBin = path.join(root, 'node_modules', '.bin', 'vite')
const forbidden = ['localhost', '.run.app', 'netlify.app', 'kcalcue.snugzap.com', 'github.com/JTKC00/ECHOES', 'jtkc00.github.io/ECHOES']

const fail = (message) => {
  throw new Error(message)
}

const assert = (condition, message) => {
  if (!condition) fail(message)
}

const read = (file) => readFileSync(path.join(dist, file), 'utf8')

const decodeJpeg = (file, label) => {
  const bytes = readFileSync(file)
  assert(bytes.length > 0, `${label} is empty`)
  let decoded
  try {
    decoded = jpeg.decode(bytes, { useTArray: true, maxResolutionInMP: 20, formatAsRGBA: true })
  } catch (error) {
    fail(`${label} failed full JPEG decode: ${error instanceof Error ? error.message : String(error)}`)
  }
  assert(decoded.width === 1200 && decoded.height === 630, `${label} decoded as ${decoded.width}x${decoded.height}, expected 1200x630`)
  assert(decoded.data.length === 1200 * 630 * 4, `${label} decoded pixel buffer is incomplete`)
  return bytes
}

const build = (context) =>
  new Promise((resolve, reject) => {
    const env = { ...process.env }
    if (context === undefined) delete env.CONTEXT
    else env.CONTEXT = context
    const child = spawn('npm', ['run', 'build'], { cwd: root, env, stdio: 'inherit' })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`npm run build failed for context ${context ?? 'unset'} with exit ${code}`))
    })
  })

const waitForServer = async (url) => {
  const started = Date.now()
  while (Date.now() - started < 15000) {
    try {
      const response = await fetch(url)
      if (response.status > 0) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  fail(`preview server did not respond at ${url}`)
}

const startPreview = async () => {
  const child = spawn(viteBin, ['preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString()
  })
  try {
    await waitForServer('http://127.0.0.1:4173/')
  } catch (error) {
    child.kill('SIGTERM')
    fail(`${error instanceof Error ? error.message : String(error)}\n${logs}`)
  }
  return child
}

const stopPreview = async (child) => {
  child.kill('SIGTERM')
  await new Promise((resolve) => child.once('exit', resolve))
}

const assertPreviewFiles = () => {
  const html = read('index.html')
  const missing = read('404.html')
  const robots = read('robots.txt')
  const headers = read('_headers')
  assert(html.includes('name="robots" content="noindex"'), 'preview homepage is missing noindex')
  assert(html.includes('rel="canonical" href="https://www.snugzap.com/"'), 'preview canonical is not production')
  assert(!html.includes('netlify.app'), 'preview HTML promotes a preview host')
  assert(html.includes('https://echoes.snugzap.com/'), 'preview HTML lost the ECHOES production URL')
  assert(missing.includes('name="robots" content="noindex"'), 'preview 404 is missing noindex')
  assert(!missing.includes('rel="canonical"'), 'preview 404 has a canonical')
  assert(!robots.includes('Disallow'), 'preview robots.txt blocks fetching')
  assert(!robots.includes('Sitemap:'), 'preview robots.txt promotes a sitemap')
  assert(headers.includes('X-Robots-Tag: noindex'), 'preview _headers is missing noindex')
  assert(!read('sitemap.xml').includes('netlify.app'), 'preview sitemap contains a preview URL')
  console.log('PASS preview build files')
}

const assertProductionFiles = () => {
  const html = read('index.html')
  const missing = read('404.html')
  const robots = read('robots.txt')
  const sitemap = read('sitemap.xml')
  assert(!html.toLowerCase().includes('noindex'), 'production homepage contains noindex')
  assert(!existsSync(path.join(dist, '_headers')), 'production artifact still contains preview _headers')
  assert(html.includes('<h1 id="hero-title">'), 'production HTML is missing the H1')
  assert((html.match(/<h1\b/g) ?? []).length === 1, 'production HTML does not have exactly one H1')
  assert(html.includes('href="/assets/'), 'production CSS is not linked as a built asset')
  assert(!html.includes('/src/main.ts'), 'production HTML still depends on the old client renderer')
  assert(html.includes('https://echoes.snugzap.com/'), 'production HTML lost the ECHOES production URL')
  for (const name of ['ECHOES', 'SwiftLocal', 'KcalCue', 'MatterDock', 'Personal Finance Manager', 'Bookstore']) {
    assert(html.includes(name), `production HTML is missing ${name}`)
  }
  for (const needle of forbidden) {
    assert(!html.toLowerCase().includes(needle.toLowerCase()), `production HTML contains forbidden URL fragment ${needle}`)
  }
  assert(robots.includes('Sitemap: https://www.snugzap.com/sitemap.xml'), 'production robots.txt does not advertise the canonical sitemap')
  assert(!robots.includes('Disallow'), 'production robots.txt blocks crawling')
  assert(sitemap.includes('<loc>https://www.snugzap.com/</loc>'), 'production sitemap is missing the homepage')
  assert(!sitemap.includes('lastmod'), 'production sitemap fabricates lastmod')
  assert((sitemap.match(/<loc>/g) ?? []).length === 1, 'production sitemap has more than the homepage')
  assert(!sitemap.includes('404'), 'production sitemap includes the 404')
  assert(missing.includes('name="robots" content="noindex"'), 'production 404 is missing noindex')
  assert(!missing.includes('rel="canonical"'), 'production 404 uses a homepage canonical')
  assert(!missing.includes('application/ld+json'), 'production 404 includes structured data')
  const sourceImage = decodeJpeg(path.join(root, 'public', 'snugzap-og.jpg'), 'source social image')
  const builtImage = decodeJpeg(path.join(dist, 'snugzap-og.jpg'), 'built social image')
  assert(
    createHash('sha256').update(sourceImage).digest('hex') === createHash('sha256').update(builtImage).digest('hex'),
    'built social image bytes differ from the source file',
  )
  console.log('PASS production build files')
}

const assertHttp = async (expectNoindex) => {
  const homeResponse = await fetch('http://127.0.0.1:4173/')
  const homeHtml = await homeResponse.text()
  assert(homeResponse.status === 200, `homepage status ${homeResponse.status}`)
  assert(homeHtml.includes('https://echoes.snugzap.com/'), 'served homepage lost the ECHOES URL')
  const robots = homeResponse.headers.get('x-robots-tag')
  if (expectNoindex) {
    assert(homeHtml.includes('noindex'), 'served preview homepage is missing noindex')
    assert(robots === 'noindex', `served preview X-Robots-Tag was ${robots}`)
  } else {
    assert(!homeHtml.toLowerCase().includes('noindex'), 'served production homepage contains noindex')
    assert(robots === null, `served production X-Robots-Tag was ${robots}`)
  }

  const missingResponse = await fetch('http://127.0.0.1:4173/this-page-does-not-exist')
  const missingHtml = await missingResponse.text()
  assert(missingResponse.status === 404, `missing path status ${missingResponse.status}`)
  assert(missingHtml.includes('This page is not here.'), '404 body is not the branded page')
  assert(missingHtml.includes('noindex'), '404 response is missing noindex')
  assert(!missingHtml.includes('rel="canonical"'), '404 response has a canonical')

  const imageResponse = await fetch('http://127.0.0.1:4173/snugzap-og.jpg')
  const imageType = imageResponse.headers.get('content-type') ?? ''
  assert(imageResponse.status === 200, `social image status ${imageResponse.status}`)
  assert(imageType.startsWith('image/jpeg'), `social image content-type ${imageType}`)
  const imageBytes = Buffer.from(await imageResponse.arrayBuffer())
  const decoded = jpeg.decode(imageBytes, { useTArray: true, formatAsRGBA: true, maxResolutionInMP: 20 })
  assert(decoded.width === 1200 && decoded.height === 630, 'served social image did not decode to 1200x630')
  console.log(`PASS HTTP ${expectNoindex ? 'preview' : 'production'} server`)
}

const main = async () => {
  decodeJpeg(path.join(root, 'public', 'snugzap-og.jpg'), 'source social image')
  console.log('PASS source social image decode')

  await build('deploy-preview')
  assertPreviewFiles()
  let server = await startPreview()
  try {
    await assertHttp(true)
  } finally {
    await stopPreview(server)
  }

  await build('production')
  assertProductionFiles()
  server = await startPreview()
  try {
    await assertHttp(false)
  } finally {
    await stopPreview(server)
  }

  await build('not-a-netlify-context')
  assert(read('index.html').includes('noindex'), 'unknown context did not default to noindex')
  assert(read('_headers').includes('X-Robots-Tag: noindex'), 'unknown context did not emit noindex headers')
  console.log('PASS unknown context defaults to noindex')

  await build('production')
  assertProductionFiles()
  console.log('PASS production rebuild cleared the unknown-context artifact')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
