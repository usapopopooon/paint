import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LocaleProvider } from './features/i18n'
import { ThemeProvider } from './features/theme'
import { PwaUpdateProvider } from './features/pwa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <PwaUpdateProvider>
          <App />
        </PwaUpdateProvider>
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>
)
