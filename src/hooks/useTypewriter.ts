import { useRef, useCallback } from 'react'
import type { ChatAction } from '../types'

const CHAR_INTERVAL_MS = 25

interface UseTypewriterOptions {
  dispatch: React.Dispatch<ChatAction>
  onComplete: () => void
}

export function useTypewriter({ dispatch, onComplete }: UseTypewriterOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullTextRef = useRef('')
  const indexRef = useRef(0)
  const messageIdRef = useRef('')
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  /** Immediately finish typing — flush the remaining text */
  const finishImmediately = useCallback(() => {
    stop()
    const remaining = fullTextRef.current.slice(indexRef.current)
    if (remaining && messageIdRef.current) {
      dispatch({ type: 'APPEND_CHAR', payload: { id: messageIdRef.current, char: remaining } })
    }
    if (messageIdRef.current) {
      dispatch({ type: 'FINISH_STREAMING', payload: { id: messageIdRef.current } })
    }
  }, [dispatch, stop])

  const start = useCallback(
    (messageId: string, fullText: string) => {
      stop()
      fullTextRef.current = fullText
      indexRef.current = 0
      messageIdRef.current = messageId

      intervalRef.current = setInterval(() => {
        if (indexRef.current < fullTextRef.current.length) {
          dispatch({
            type: 'APPEND_CHAR',
            payload: { id: messageIdRef.current, char: fullTextRef.current[indexRef.current] },
          })
          indexRef.current++
        } else {
          stop()
          dispatch({ type: 'FINISH_STREAMING', payload: { id: messageIdRef.current } })
          onCompleteRef.current()
        }
      }, CHAR_INTERVAL_MS)
    },
    [dispatch, stop]
  )

  return { start, stop, finishImmediately }
}
