import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { Layout } from '@/components/layout.tsx'

import { Dashboard } from '@/pages/dashboard.tsx'

import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path='logs' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='/logs/:id' element={<App />} />
            <Route path='/logs/current' element={<App />} />
          </Route>

          <Route path='*' element={<Navigate to='/logs' replace />} />
        </Routes>
      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
