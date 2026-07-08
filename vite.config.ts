import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static SPA build → deployable to Cloudflare Pages (output: dist/)
export default defineConfig({
  plugins: [react()],
})
