import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({ fastRefresh: false }), // Disabled to allow Cypress e2e tests to run correctly
    tailwindcss()
  ],
})
