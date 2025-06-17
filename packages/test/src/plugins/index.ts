import { autoUpdate } from '@jl-org/tool'
import { arrPolyfill } from './arrPolyfill'
import { PromisePolyfill } from './PromisePolyfill'

PromisePolyfill()
arrPolyfill()

autoUpdate({
  needUpdate: () => !import.meta.env.DEV,
})
