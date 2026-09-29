/** Dependency-free browser acceptance. Requires Node 22+ and Chrome/Chromium. */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { resolve, extname, sep, join } from 'node:path'
import { tmpdir } from 'node:os'

const root = resolve('dist')
const indexable = process.env.CONTEXT === 'production'
const context = indexable ? 'production' : 'preview'
const chromePath = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p))
assert.ok(chromePath, 'Chrome unavailable: browser acceptance is BLOCKED, not PASS. Set CHROME_PATH.')
assert.equal(typeof WebSocket, 'function', 'Use Node 22+ for native CDP WebSocket support')
const output = resolve('artifacts', context)
mkdirSync(output, { recursive: true })
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' }
// Local static host, deliberately without SPA fallback. Netlify HTTP checks are separate.
const server = createServer((request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost')
    const file = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname))
    const found = file.startsWith(root + sep) && existsSync(file) && !url.pathname.endsWith('/')
    const isHome = url.pathname === '/'
    const target = isHome ? join(root, 'index.html') : found ? file : join(root, '404.html')
    response.statusCode = isHome || found ? 200 : 404
    response.setHeader('Content-Type', mime[extname(target)] ?? 'application/octet-stream')
    if (!indexable || response.statusCode === 404 || url.pathname === '/404.html') response.setHeader('X-Robots-Tag', 'noindex, nofollow')
    response.end(request.method === 'HEAD' ? undefined : readFileSync(target))
  } catch { response.statusCode = 400; response.end('Bad request') }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`
const profile = mkdtempSync(join(tmpdir(), 'snugzap-chrome-'))
const chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let socket
const pending = new Map()
try {
  const endpoint = await new Promise((accept, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome startup timeout')), 15000)
    let stderr = ''
    chrome.once('error', (e) => { clearTimeout(timer); reject(e) })
    chrome.stderr.on('data', (data) => {
      stderr += String(data)
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (match) { clearTimeout(timer); accept(match[1]) }
    })
  })
  const address = new URL(endpoint)
  const pages = await (await fetch(`http://${address.host}/json/list`)).json()
  socket = new WebSocket(pages.find((p) => p.type === 'page').webSocketDebuggerUrl)
  await new Promise((accept, reject) => { socket.addEventListener('open', accept, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  let sequence = 0
  socket.addEventListener('message', ({ data }) => {
    const value = JSON.parse(String(data))
    const entry = pending.get(value.id)
    if (!entry) return
    clearTimeout(entry.timer); pending.delete(value.id)
    if (value.error) entry.reject(new Error(JSON.stringify(value.error)))
    else entry.accept(value.result)
  })
  const send = (method, params = {}) => new Promise((accept, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    pending.set(id, { accept, reject, timer })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  await send('Page.enable')
  const navigate = async (path) => {
    const result = await send('Page.navigate', { url: origin + path })
    assert.ok(!result.errorText, result.errorText)
    for (let i = 0; i < 50; i++) {
      if (await evaluate('document.readyState === "complete" && !!document.querySelector("main")')) return
      await new Promise((done) => setTimeout(done, 100))
    }
    throw new Error('Page did not finish loading')
  }
  const results = []
  for (const disabled of [true, false]) {
    await send('Emulation.setScriptExecutionDisabled', { value: disabled })
    for (const width of [375, 430, 768, 1024, 1440]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
      await navigate('/')
      const state = await evaluate(`(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        h1: document.querySelectorAll('h1').length,
        cards: document.querySelectorAll('article').length,
        canonical: document.querySelector('link[rel=canonical]').href,
        robots: document.querySelector('meta[name=robots]').content,
        css: document.styleSheets.length,
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')),
        invalidFragments: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).length,
        overflow: [...document.querySelectorAll('main *, .site-header *, .site-footer *')].filter(e => {
          if (e.classList.contains('sr-only')) return false;
          const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
        }).map(e => e.tagName + '.' + e.className)
      }))()`)
      assert.equal(state.scrollWidth, width)
      assert.deepEqual(state.overflow, [], `Overflow at ${width}`)
      assert.equal(state.h1, 1); assert.equal(state.cards, 6)
      assert.equal(state.canonical, 'https://www.snugzap.com/')
      assert.equal(state.robots, indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow')
      assert.ok(state.css > 0); assert.equal(state.scroll, 'auto'); assert.equal(state.invalidFragments, 0)
      assert.ok(state.links.includes('https://echoes.snugzap.com/'))
      results.push({ javascriptDisabled: disabled, ...state })
      if (disabled && (width === 375 || width === 1440)) {
        const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
        writeFileSync(join(output, `home-${width}-nojs.png`), Buffer.from(screenshot.data, 'base64'))
      }
    }
  }
  writeFileSync(join(output, 'viewport-results.json'), JSON.stringify({ context, viewports: results }, null, 2))
  // DevTools evaluation is distinct from site scripts; turn scripts on explicitly for the decoder probe.
  await send('Emulation.setScriptExecutionDisabled', { value: false })
  const image = await evaluate(`(async () => { const image = new Image(); image.src='/snugzap-og.jpg'; await image.decode(); return { width:image.naturalWidth, height:image.naturalHeight }; })()`)
  assert.deepEqual(image, { width: 1200, height: 630 })
  await navigate('/')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  assert.equal(await evaluate('document.activeElement.className'), 'skip-link')
  assert.ok(await evaluate('document.activeElement.getBoundingClientRect().top >= 0'))
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  assert.equal(await evaluate('location.hash'), '#main-content')
  const notFound = await fetch(origin + '/this-page-does-not-exist')
  assert.equal(notFound.status, 404)
  assert.ok((await notFound.text()).includes('Page not found.'))
  const picture = await fetch(origin + '/snugzap-og.jpg')
  assert.equal(picture.headers.get('content-type'), 'image/jpeg')
  const report = { result: 'PASS', context, note: 'Local built output, not Netlify runtime or field Core Web Vitals', image, notFoundStatus: notFound.status, viewports: results }
  writeFileSync(join(output, 'browser-results.json'), JSON.stringify(report, null, 2))
  console.log(`Browser PASS: ${context}, 5 widths with JS disabled/enabled, skip link, reduced motion, image decode and local 404.`)
} finally {
  for (const entry of pending.values()) clearTimeout(entry.timer)
  socket?.close()
  chrome.kill()
  await new Promise((done) => server.close(done))
  await new Promise((done) => setTimeout(done, 150))
  rmSync(profile, { recursive: true, force: true })
}
