import App from '@/App.tsx'
import { createRoot } from 'react-dom/client'
import '@/plugins'

import './tailwind.css'

createRoot(document.getElementById('app')!).render(
  <App />,
)
