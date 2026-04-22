import { useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Header from './components/Header'
import MessageList from './components/MessageList'
import InputBar from './components/InputBar'
import { useChatReducer } from './hooks/useChatReducer'
import { useTypewriter } from './hooks/useTypewriter'
import { getNextAiAResponse, getNextAiBResponse, resetMockIndices } from './mock/responses'

export default function App() {
  const [state, dispatch] = useChatReducer()
  const stateRef = useRef(state)
  stateRef.current = state

  // Track whether we should stop after current typewriter finishes
  const shouldStopRef = useRef(false)

  const scheduleNextAi = useCallback(
    (lastMessageId: string, nextRole: 'ai-a' | 'ai-b') => {
      // Check if we should stop
      if (shouldStopRef.current) {
        shouldStopRef.current = false
        dispatch({ type: 'SET_STATUS', payload: 'idle' })
        return
      }

      const currentState = stateRef.current

      // After AI-B finishes, that counts as one round
      if (nextRole === 'ai-a') {
        dispatch({ type: 'INCREMENT_ROUND' })
        // Check round limit (currentRound is 0-indexed before increment, +1 already happened)
        if (currentState.currentRound + 1 >= currentState.maxRounds) {
          dispatch({ type: 'SET_STATUS', payload: 'idle' })
          return
        }
      }

      // Small delay before next AI starts
      setTimeout(() => {
        if (shouldStopRef.current) {
          shouldStopRef.current = false
          dispatch({ type: 'SET_STATUS', payload: 'idle' })
          return
        }

        const id = uuidv4()
        const text = nextRole === 'ai-a' ? getNextAiAResponse() : getNextAiBResponse()

        dispatch({
          type: 'START_STREAMING',
          payload: { id, role: nextRole, replyTo: lastMessageId },
        })

        typewriter.start(id, text)
      }, 500)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const onTypewriterComplete = useCallback(() => {
    const currentState = stateRef.current
    if (currentState.status !== 'discussing') return

    const lastMsg = currentState.messages[currentState.messages.length - 1]
    if (!lastMsg) return

    if (lastMsg.role === 'ai-a') {
      scheduleNextAi(lastMsg.id, 'ai-b')
    } else if (lastMsg.role === 'ai-b') {
      scheduleNextAi(lastMsg.id, 'ai-a')
    }
  }, [scheduleNextAi])

  const typewriter = useTypewriter({
    dispatch,
    onComplete: onTypewriterComplete,
  })

  const handleSend = useCallback(
    (text: string) => {
      const isInterrupting = stateRef.current.status === 'discussing'

      // If interrupting, finish current typewriter immediately
      if (isInterrupting) {
        typewriter.finishImmediately()
      }

      // Reset mock indices on new conversation
      if (!isInterrupting) {
        resetMockIndices()
      }

      // Add user message
      const userMsgId = uuidv4()
      const lastMsg = stateRef.current.messages[stateRef.current.messages.length - 1]
      dispatch({
        type: 'SEND_MESSAGE',
        payload: {
          id: userMsgId,
          role: 'user',
          content: text,
          replyTo: lastMsg?.id ?? null,
        },
      })

      // Start/reset discussion
      dispatch({ type: 'SET_STATUS', payload: 'discussing' })
      dispatch({ type: 'RESET_ROUNDS' })
      shouldStopRef.current = false

      // Start AI-A response after a brief delay
      setTimeout(() => {
        const aiMsgId = uuidv4()
        const aiText = getNextAiAResponse()

        dispatch({
          type: 'START_STREAMING',
          payload: { id: aiMsgId, role: 'ai-a', replyTo: userMsgId },
        })

        typewriter.start(aiMsgId, aiText)
      }, 300)
    },
    [dispatch, typewriter]
  )

  const handleStop = useCallback(() => {
    shouldStopRef.current = true
    typewriter.finishImmediately()
    dispatch({ type: 'STOP_DISCUSSION' })
  }, [dispatch, typewriter])

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header
        currentRound={state.currentRound}
        maxRounds={state.maxRounds}
        isDiscussing={state.status === 'discussing'}
        onStop={handleStop}
      />
      <MessageList
        messages={state.messages}
        streamingMessageId={state.streamingMessageId}
      />
      <InputBar onSend={handleSend} />
    </div>
  )
}
