import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProviderWrapper from '@/auth/AuthProviderWrapper'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <AuthProviderWrapper>
    <App />
  </AuthProviderWrapper>
  // </StrictMode>,
)
