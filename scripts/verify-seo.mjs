import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const jpeg = require('jpeg-js')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const viteBin = path.join(root, 'node_modules', '.bin', 'vite')
const forbidden = ['localhost', '.run.app', 'netlify.app', 'github.com/JTKC00/ECHOES', 'jtkc00.github.io/ECHOES']

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

const startPreview = async (mode = 'preview') => {
  const child = spawn(viteBin, [...(mode === 'preview' ? ['preview'] : []), '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    cwd: root,
    env: mode === 'dev' ? { ...process.env, CONTEXT: 'dev' } : process.env,
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

const assertProductHtml = (html, expectNoindex) => {
  assert(html.includes('<h1 id="echoes-title">ECHOES</h1>'), 'ECHOES page is missing its product H1')
  assert((html.match(/<h1\b/g) ?? []).length === 1, 'ECHOES page must have one H1')
  assert(html.includes('rel="canonical" href="https://www.snugzap.com/echoes/"'), 'ECHOES canonical is incorrect')
  assert(html.includes('og:url" content="https://www.snugzap.com/echoes/"'), 'ECHOES social URL is incorrect')
  assert(html.includes('<title>ECHOES'), 'ECHOES page uses the homepage title')
  assert(html.includes('og:title" content="ECHOES'), 'ECHOES social title is incorrect')
  assert(html.includes('twitter:title" content="ECHOES'), 'ECHOES Twitter title is incorrect')
  assert(html.includes('og:image" content="https://www.snugzap.com/echoes/echoes-og.jpg"'), 'ECHOES social image is incorrect')
  assert(html.includes('theme-color" content="#080e18"'), 'ECHOES browser theme color is incorrect')
  assert(html.includes('"@type":"WebPage"'), 'ECHOES structured data is missing')
  assert((html.match(/href="https:\/\/echoes\.snugzap\.com\/"/g) ?? []).length === 2, 'ECHOES must have two game CTAs')
  assert(html.includes('name="robots" content="noindex"') === expectNoindex, 'ECHOES indexability is incorrect')
  for (const id of ['overview', 'combat', 'story', 'characters', 'development']) {
    assert(html.includes(`id="${id}"`), `ECHOES is missing ${id}`)
  }
  for (const needle of forbidden) {
    assert(!html.toLowerCase().includes(needle.toLowerCase()), `ECHOES contains forbidden URL fragment ${needle}`)
  }
}

const assertProductFiles = (expectNoindex) => {
  const html = read('echoes/index.html')
  assertProductHtml(html, expectNoindex)
  assert(html.includes('href="/assets/'), 'ECHOES CSS is not a built asset')
  assert(!html.includes('/src/'), 'ECHOES still depends on source files')
  for (const name of readdirSync(path.join(root, 'public', 'echoes')).filter((name) => name.endsWith('.webp'))) {
    const source = readFileSync(path.join(root, 'public', 'echoes', name))
    const built = readFileSync(path.join(dist, 'echoes', name))
    assert(source.equals(built), `${name} built artwork differs from source`)
  }
}

const assertSwiftLocalHtml = (html, expectNoindex) => {
  assert((html.match(/<h1\b/g) ?? []).length === 1 && html.includes('<h1 id="swiftlocal-title">SwiftLocal</h1>'), 'SwiftLocal product H1 is incorrect')
  assert(html.includes('rel="canonical" href="https://www.snugzap.com/swiftlocal/"'), 'SwiftLocal canonical is incorrect')
  assert(html.includes('og:url" content="https://www.snugzap.com/swiftlocal/"'), 'SwiftLocal social URL is incorrect')
  assert(html.includes('og:image" content="https://www.snugzap.com/swiftlocal/swiftlocal-og.jpg"'), 'SwiftLocal social image is incorrect')
  assert(html.includes('"@type":"WebPage"'), 'SwiftLocal structured data is missing')
  assert(html.includes('Windows x64 is the officially supported platform'), 'SwiftLocal platform guidance is missing')
  assert(html.includes('href="https://github.com/JTKC00/SwiftLocal/releases/latest"'), 'SwiftLocal official download is missing')
  assert(html.includes('name="robots" content="noindex"') === expectNoindex, 'SwiftLocal indexability is incorrect')
}

const assertSwiftLocalFiles = (expectNoindex) => {
  const html = read('swiftlocal/index.html')
  assertSwiftLocalHtml(html, expectNoindex)
  assert(html.includes('href="/assets/') && !html.includes('/src/'), 'SwiftLocal CSS is not built')
  for (const name of ['workspace.webp', 'mark.svg', 'swiftlocal-og.jpg']) {
    assert(readFileSync(path.join(root, 'public', 'swiftlocal', name)).equals(readFileSync(path.join(dist, 'swiftlocal', name))), `SwiftLocal built ${name} differs from source`)
  }
}

const assertPreviewFiles = () => {
  const html = read('index.html')
  const missing = read('404.html')
  const robots = read('robots.txt')
  const headers = read('_headers')
  assert(html.includes('name="robots" content="noindex"'), 'preview homepage is missing noindex')
  assert(html.includes('rel="canonical" href="https://www.snugzap.com/"'), 'preview canonical is not production')
  assert(!html.includes('netlify.app'), 'preview HTML promotes a preview host')
  assert(html.includes('href="/echoes/"'), 'preview homepage lost the ECHOES product link')
  assertProductFiles(true)
  assertSwiftLocalFiles(true)
  assert(html.includes('https://kcalcue.snugzap.com/'), 'preview HTML lost the KcalCue production URL')
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
  assert(html.includes('href="/echoes/"'), 'production homepage lost the ECHOES product link')
  assertProductFiles(false)
  assertSwiftLocalFiles(false)
  assert(html.includes('https://kcalcue.snugzap.com/'), 'production HTML lost the KcalCue production URL')
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
  assert(sitemap.includes('<loc>https://www.snugzap.com/echoes/</loc>'), 'production sitemap is missing ECHOES')
  assert((sitemap.match(/<loc>/g) ?? []).length === 3, 'production sitemap must contain exactly the three published pages')
  assert(sitemap.includes('<loc>https://www.snugzap.com/swiftlocal/</loc>'), 'production sitemap is missing SwiftLocal')
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
  const echoesSource = decodeJpeg(path.join(root, 'public', 'echoes', 'echoes-og.jpg'), 'ECHOES source social image')
  const echoesBuilt = decodeJpeg(path.join(dist, 'echoes', 'echoes-og.jpg'), 'ECHOES built social image')
  assert(echoesSource.equals(echoesBuilt), 'ECHOES built social image bytes differ from source')
  const swiftSource = decodeJpeg(path.join(root, 'public', 'swiftlocal', 'swiftlocal-og.jpg'), 'SwiftLocal source social image')
  const swiftBuilt = decodeJpeg(path.join(dist, 'swiftlocal', 'swiftlocal-og.jpg'), 'SwiftLocal built social image')
  assert(swiftSource.equals(swiftBuilt), 'SwiftLocal social image differs from source')
  console.log('PASS production build files')
}

const assertHttp = async (expectNoindex) => {
  const homeResponse = await fetch('http://127.0.0.1:4173/')
  const homeHtml = await homeResponse.text()
  assert(homeResponse.status === 200, `homepage status ${homeResponse.status}`)
  assert(homeHtml.includes('href="/swiftlocal/"'), 'served homepage lost the SwiftLocal product link')
  assert(homeHtml.includes('href="/echoes/"'), 'served homepage lost the ECHOES product link')
  assert(homeHtml.includes('https://kcalcue.snugzap.com/'), 'served homepage lost the KcalCue URL')
  const robots = homeResponse.headers.get('x-robots-tag')
  if (expectNoindex) {
    assert(homeHtml.includes('noindex'), 'served preview homepage is missing noindex')
    assert(robots === 'noindex', `served preview X-Robots-Tag was ${robots}`)
  } else {
    assert(!homeHtml.toLowerCase().includes('noindex'), 'served production homepage contains noindex')
    assert(robots === null, `served production X-Robots-Tag was ${robots}`)
  }

  for (const url of ['/echoes/', '/echoes/?from=home', '/echoes/index.html']) {
    const response = await fetch(`http://127.0.0.1:4173${url}`)
    const html = await response.text()
    assert(response.status === 200, `${url} status ${response.status}`)
    assertProductHtml(html, expectNoindex)
    assert(response.headers.get('x-robots-tag') === (expectNoindex ? 'noindex' : null), `${url} incorrect robots header`)
  }
  for (const url of ['/swiftlocal/', '/swiftlocal/?from=home', '/swiftlocal/index.html']) {
    const response = await fetch(`http://127.0.0.1:4173${url}`)
    assert(response.status === 200, `${url} status ${response.status}`)
    assertSwiftLocalHtml(await response.text(), expectNoindex)
    assert(response.headers.get('x-robots-tag') === (expectNoindex ? 'noindex' : null), `${url} incorrect robots header`)
  }
  const swiftRedirect = await fetch('http://127.0.0.1:4173/swiftlocal?from=home', { redirect: 'manual' })
  assert(swiftRedirect.status === 308 && swiftRedirect.headers.get('location') === '/swiftlocal/?from=home', 'SwiftLocal redirect lost path or query')
  const redirect = await fetch('http://127.0.0.1:4173/echoes?from=home', { redirect: 'manual' })
  assert(redirect.status === 308, `/echoes status ${redirect.status}`)
  assert(redirect.headers.get('location') === '/echoes/?from=home', '/echoes redirect lost path or query')
  for (const url of ['/echoes/characters/', '/echoes/world/', '/echoes/news/', '/echoes/missing', '/swiftlocal/missing/']) {
    const response = await fetch(`http://127.0.0.1:4173${url}`)
    const html = await response.text()
    assert(response.status === 404, `${url} must remain 404`)
    assert(html.includes('noindex') && !html.includes('rel="canonical"'), `${url} has incorrect 404 metadata`)
  }

  const missingResponse = await fetch('http://127.0.0.1:4173/this-page-does-not-exist')
  const missingHtml = await missingResponse.text()
  assert(missingResponse.status === 404, `missing path status ${missingResponse.status}`)
  assert(missingHtml.includes('This page is not here.'), '404 body is not the branded page')
  assert(missingHtml.includes('noindex'), '404 response is missing noindex')
  assert(!missingHtml.includes('rel="canonical"'), '404 response has a canonical')

  for (const imagePath of ['/snugzap-og.jpg', '/echoes/echoes-og.jpg', '/swiftlocal/swiftlocal-og.jpg']) {
    const imageResponse = await fetch(`http://127.0.0.1:4173${imagePath}`)
    const imageType = imageResponse.headers.get('content-type') ?? ''
    assert(imageResponse.status === 200, `social image status ${imageResponse.status}`)
    assert(imageType.startsWith('image/jpeg'), `social image content-type ${imageType}`)
    const imageBytes = Buffer.from(await imageResponse.arrayBuffer())
    const decoded = jpeg.decode(imageBytes, { useTArray: true, formatAsRGBA: true, maxResolutionInMP: 20 })
    assert(decoded.width === 1200 && decoded.height === 630, 'served social image did not decode to 1200x630')
  }
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
  assertProductFiles(true)
  assertSwiftLocalFiles(true)
  assert(read('_headers').includes('X-Robots-Tag: noindex'), 'unknown context did not emit noindex headers')
  console.log('PASS unknown context defaults to noindex')

  await build('production')
  assertProductionFiles()
  console.log('PASS production rebuild cleared the unknown-context artifact')

  await build(undefined)
  assertPreviewFiles()
  console.log('PASS unset context defaults to noindex')
  server = await startPreview('dev')
  try {
    await assertHttp(true)
    console.log('PASS dev server nested page routes')
  } finally {
    await stopPreview(server)
  }
  await build('production')
  assertProductionFiles()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
