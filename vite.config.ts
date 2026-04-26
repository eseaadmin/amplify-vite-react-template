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
  },
})
