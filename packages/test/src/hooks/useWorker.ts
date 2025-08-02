import { useEffect, useRef, useState } from 'react'
import { onUnmounted } from './lifecycle'

export function useWorker<T = any>(
  WorkerScript: string | (new () => Worker),
  options: WorkerOptions = {},
) {
  const { autoTerminate = true, debug = false } = options
  const workerRef = useRef<Worker | null>(null)
  const cbsRef = useRef<WorkerListener[]>([])

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<ErrorEvent | null>(null)

  useEffect(() => {
    try {
      const worker = typeof WorkerScript === 'string'
        ? new Worker(WorkerScript)
        : new WorkerScript()

      workerRef.current = worker
      setIsReady(true)

      if (debug) {
        console.log('Worker initialized:', WorkerScript)
      }

      return () => {
        if (autoTerminate) {
          workerRef.current?.terminate()
          if (debug) {
            console.log('Worker terminated')
          }
        }
      }
    }
    catch (err) {
      const workerError = err as ErrorEvent
      setError(workerError)
      console.error('Worker initialization failed:', workerError)
    }
  }, [WorkerScript, autoTerminate, debug])

  onUnmounted(() => {
    workerRef.current?.terminate()
  })

  // Post message to worker
  const postMessage = useCallback(<TData>(data: TData, transfer?: Transferable[]) => {
    if (!workerRef.current) {
      console.warn('Worker not initialized')
      return
    }
    workerRef.current.postMessage(data, transfer || [])
  }, [])

  // Listen to worker messages
  const onMessage = useCallback((handler: WorkerMessageHandler<T>) => {
    if (!workerRef.current)
      return

    const worker = workerRef.current
    worker.addEventListener('message', handler)
    cbsRef.current.push({
      event: 'message',
      fn: handler,
    })
  }, [])

  // Listen to worker errors
  const onError = useCallback((handler: WorkerErrorHandler) => {
    if (!workerRef.current)
      return

    const worker = workerRef.current
    worker.addEventListener('error', handler)
    cbsRef.current.push({
      event: 'error',
      fn: handler,
    })
  }, [])

  const unbindEvent = useCallback(() => {
    cbsRef.current.forEach(({ event, fn }) => {
      // @ts-ignore
      workerRef.current?.removeEventListener(event, fn)
    })
  }, [])

  // Manually terminate worker
  const terminate = useCallback(() => {
    if (!workerRef.current) {
      return
    }

    workerRef.current.terminate()
    workerRef.current = null
    setIsReady(false)
    unbindEvent()

    if (debug) {
      console.log('Worker manually terminated')
    }
  }, [debug, unbindEvent])

  return {
    worker: workerRef.current,
    postMessage,
    onMessage,
    onError,
    terminate,
    unbindEvent,
    isReady,
    error,
  }
}

export type WorkerOptions = {
  /**
   * @default true
   */
  autoTerminate?: boolean
  debug?: boolean
}

export type WorkerMessageHandler<T = any> = (event: MessageEvent<T>) => void
export type WorkerErrorHandler = (error: ErrorEvent) => void

export type WorkerListener = {
  event: keyof WorkerEventMap
  fn: WorkerMessageHandler | WorkerErrorHandler
}
