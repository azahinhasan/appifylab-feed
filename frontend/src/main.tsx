import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/bootstrap.min.css'
import './assets/css/common.css'
import './assets/css/main.css'
import './assets/css/responsive.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
