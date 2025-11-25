import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [uni()],
  server: {
    host: true,
    port: 5175,
    hmr: {
      clientPort: 5175
    }
  }
})
