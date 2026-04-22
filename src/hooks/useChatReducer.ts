import { useReducer } from 'react'
import type { ChatState, ChatAction } from '../types'

const initialState: ChatState = {
  messages: [],
  currentRound: 0,
  maxRounds: 5,
  status: 'idle',
  streamingMessageId: null,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.payload.id,
            role: action.payload.role,
            content: action.payload.content,
            replyTo: action.payload.replyTo,
            timestamp: Date.now(),
          },
        ],
      }

    case 'START_STREAMING':
      return {
        ...state,
        streamingMessageId: action.payload.id,
        messages: [
          ...state.messages,
          {
            id: action.payload.id,
            role: action.payload.role,
            content: '',
            replyTo: action.payload.replyTo,
            timestamp: Date.now(),
          },
        ],
      }

    case 'APPEND_CHAR':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: msg.content + action.payload.char }
            : msg
        ),
      }

    case 'FINISH_STREAMING':
      return {
        ...state,
        streamingMessageId: null,
      }

    case 'INCREMENT_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
      }

    case 'STOP_DISCUSSION':
      return {
        ...state,
        status: 'idle',
        streamingMessageId: null,
      }

    case 'RESET_ROUNDS':
      return {
        ...state,
        currentRound: 1,
      }

    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
      }

    default:
      return state
  }
}

export function useChatReducer() {
  return useReducer(chatReducer, initialState)
}
