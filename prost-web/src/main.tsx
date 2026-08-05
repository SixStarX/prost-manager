import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error tracking opcional: só carrega o Sentry se o DSN estiver configurado.
if (import.meta.env.VITE_SENTRY_DSN) {
  import('./sentry').then((m) => m.initSentry())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
