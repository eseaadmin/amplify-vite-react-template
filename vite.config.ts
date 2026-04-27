import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const SRC = resolve(__dirname, 'amplify_outputs.json')
const DEST = resolve(__dirname, 'public/amplify_outputs.json')

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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), syncAmplifyOutputs()],
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
        membership: resolve(__dirname, 'membership.html'),
        partnership: resolve(__dirname, 'partnership.html'),
        transparency: resolve(__dirname, 'transparency.html'),
        youtube: resolve(__dirname, 'youtube.html'),
      },
    },
  },
})
