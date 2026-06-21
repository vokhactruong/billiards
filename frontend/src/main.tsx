import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { syncClock } from './lib/clockSync'

syncClock() // fire-and-forget; corrects Date.now() drift vs server clock

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
