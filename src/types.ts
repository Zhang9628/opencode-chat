export type Role = 'user' | 'ai-a' | 'ai-b'

export interface Message {
  id: string
  role: Role
  content: string
  replyTo: string | null
  timestamp: number
}

export interface ChatState {
  messages: Message[]
  currentRound: number
  maxRounds: number
  status: 'idle' | 'discussing'
  /** The id of the message currently being "typed" */
  streamingMessageId: string | null
}

export type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { id: string; role: Role; content: string; replyTo: string | null } }
  | { type: 'START_STREAMING'; payload: { id: string; role: Role; replyTo: string | null } }
  | { type: 'APPEND_CHAR'; payload: { id: string; char: string } }
  | { type: 'FINISH_STREAMING'; payload: { id: string } }
  | { type: 'INCREMENT_ROUND' }
  | { type: 'STOP_DISCUSSION' }
  | { type: 'RESET_ROUNDS' }
  | { type: 'SET_STATUS'; payload: 'idle' | 'discussing' }
