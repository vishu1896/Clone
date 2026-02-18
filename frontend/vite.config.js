import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{port:3000,},//we have changed the localhost to 3000 from 5173 
})
