import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { routes } from './App'
import { applyDraftsParamFromAddress } from './lib/drafts'

// Runs before the router is created, because the router reads the address when it is created.
applyDraftsParamFromAddress()

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
