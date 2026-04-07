import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="625232295727-csorgtohtemg7e9db3t8d1nqabilten9.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)