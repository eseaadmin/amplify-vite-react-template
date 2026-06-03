import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const SRC = resolve(__dirname, 'amplify_outputs.json')
const DEST = resolve(__dirname, 'public/amplify_outputs.json')
const ADMIN_REDIRECT_TARGET = '/content/'

const adminRedirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0; url=${ADMIN_REDIRECT_TARGET}">
  <link rel="canonical" href="${ADMIN_REDIRECT_TARGET}">
  <title>Redirecting...</title>
</head>
<body>
  <script>window.location.replace('${ADMIN_REDIRECT_TARGET}')</script>
  <a href="${ADMIN_REDIRECT_TARGET}">Continue</a>
</body>
</html>
`

const syncAmplifyOutputs = () => ({
  name: 'sync-amplify-outputs',
  buildStart() {
    if (existsSync(SRC)) copyFileSync(SRC, DEST)
  },
  configureServer(server: { watcher: { add: (p: string) => void; on: (e: string, cb: (p: string) => void) => void } }) {
    if (existsSync(SRC)) copyFileSync(SRC, DEST)
    server.watcher.add(SRC)
    server.watcher.on('change', (path) => {
      if (path === SRC) copyFileSync(SRC, DEST)
    })
  },
})

const adminRedirect = () => ({
  name: 'admin-redirect',
  configureServer(server: { middlewares: { use: (path: string, cb: (_req: unknown, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void }) => void) => void } }) {
    server.middlewares.use('/admin.html', (_req, res) => {
      res.statusCode = 302
      res.setHeader('Location', ADMIN_REDIRECT_TARGET)
      res.end()
    })
  },
  configurePreviewServer(server: { middlewares: { use: (path: string, cb: (_req: unknown, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void }) => void) => void } }) {
    server.middlewares.use('/admin.html', (_req, res) => {
      res.statusCode = 302
      res.setHeader('Location', ADMIN_REDIRECT_TARGET)
      res.end()
    })
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'admin.html',
      source: adminRedirectHtml,
    })
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), syncAmplifyOutputs(), adminRedirect()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        blog: resolve(__dirname, 'blog.html'),
        briefing: resolve(__dirname, 'briefing.html'),
        contact: resolve(__dirname, 'contact.html'),
        content: resolve(__dirname, 'content.html'),
        membership: resolve(__dirname, 'membership.html'),
        partnership: resolve(__dirname, 'partnership.html'),
        transparency: resolve(__dirname, 'transparency.html'),
        youtube: resolve(__dirname, 'youtube.html'),
      },
    },
  },
})
