import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    server: {
      port: 3000
    }
  }
})