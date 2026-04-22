import type { Message } from '../types'
import ReplyTag from './ReplyTag'
import MarkdownBody from './MarkdownBody'

interface MessageBubbleProps {
  message: Message
  allMessages: Message[]
  isStreaming: boolean
}

const ROLE_CONFIG = {
  user: {
    label: 'You',
    icon: '👤',
    bgColor: 'bg-blue-900/40',
    borderColor: 'border-blue-700/50',
    align: 'justify-end' as const,
  },
  'ai-a': {
    label: 'AI-A',
    icon: '🤖',
    bgColor: 'bg-gray-800/60',
    borderColor: 'border-cyan-700/40',
    align: 'justify-start' as const,
  },
  'ai-b': {
    label: 'AI-B',
    icon: '🧠',
    bgColor: 'bg-gray-800/60',
    borderColor: 'border-purple-700/40',
    align: 'justify-start' as const,
  },
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageBubble({ message, allMessages, isStreaming }: MessageBubbleProps) {
  const config = ROLE_CONFIG[message.role]

  return (
    <div className={`flex ${config.align} px-4 py-1`}>
      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 border ${config.bgColor} ${config.borderColor}`}
      >
        {/* Header: icon + name + reply tag + time */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">{config.icon}</span>
            <span className="text-sm font-medium text-gray-300">{config.label}</span>
            <ReplyTag replyToId={message.replyTo} messages={allMessages} />
          </div>
          <span className="text-xs text-gray-500 shrink-0">{formatTime(message.timestamp)}</span>
        </div>

        {/* Content */}
        <div className={isStreaming ? 'typing-cursor' : ''}>
          <MarkdownBody content={message.content} />
        </div>
      </div>
    </div>
  )
}
