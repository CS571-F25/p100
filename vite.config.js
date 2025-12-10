import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/p100/',
  build: {
    outDir: 'docs',  
    sourcemap: false
  }
})