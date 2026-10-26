import React from 'react'
import ReactDOM from 'react-dom/client'
import { SimpleApp } from './SimpleApp'

const rootElement = document.getElementById('root')

if (!rootElement) {
  const errDiv = document.createElement('div')
  errDiv.style.cssText = 'padding: 20px; color: red;'
  const h1 = document.createElement('h1')
  h1.textContent = 'Error: Root element not found'
  const p = document.createElement('p')
  p.textContent = 'The #root element is missing from the HTML.'
  errDiv.appendChild(h1)
  errDiv.appendChild(p)
  document.body.appendChild(errDiv)
} else {
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <SimpleApp />
      </React.StrictMode>,
    )
  } catch (error) {
    const errDiv = document.createElement('div')
    errDiv.style.cssText = 'padding: 20px; color: red;'
    const h1 = document.createElement('h1')
    h1.textContent = 'React Error'
    const p = document.createElement('p')
    p.textContent = error instanceof Error ? error.message : String(error)
    errDiv.appendChild(h1)
    errDiv.appendChild(p)
    document.body.appendChild(errDiv)
  }
}

// Global error handlers — log silently to avoid exposing internals
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})