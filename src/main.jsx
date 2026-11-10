import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { supabaseConfigured } from './lib/supabase'

// A live site without database settings would otherwise show an empty shop and "successful"
// orders that are never saved, so stop with a clear message instead.
const misconfigured = import.meta.env.PROD && !supabaseConfigured

createRoot(document.getElementById('root')).render(
  misconfigured ? (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 480, margin: '4rem auto' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Shop is not set up yet</h1>
      <p style={{ marginTop: '0.5rem', color: '#555' }}>
        VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing from this deployment. Add them in the
        hosting settings and redeploy.
      </p>
    </div>
  ) : (
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
  ),
)
