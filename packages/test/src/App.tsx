import { AnimatePresence } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { KeepAliveProvider } from './components/KeepAlive'
import { useChangeTheme } from './hooks'
import { router } from './router'

function App() {
  useChangeTheme()

  return (
    <KeepAliveProvider>

      <AnimatePresence>
        <RouterProvider router={ router } />
      </AnimatePresence>

    </KeepAliveProvider>
  )
}

export default App
