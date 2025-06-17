import { CusotmSuspense } from '@/components/CusotmSuspense'
import { AnimatePresence } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { KeepAliveProvider } from './components/KeepAlive'
import { useChangeTheme } from './hooks'
import { router } from './router'

function App() {
  useChangeTheme()

  return (
    <KeepAliveProvider>

      <CusotmSuspense>
        <AnimatePresence>
          <RouterProvider router={ router } />
        </AnimatePresence>
      </CusotmSuspense>

    </KeepAliveProvider>
  )
}

export default App
