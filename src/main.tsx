import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/alexandria/400.css'
import '@fontsource/alexandria/500.css'
import '@fontsource/alexandria/600.css'
import '@fontsource/alexandria/700.css'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
