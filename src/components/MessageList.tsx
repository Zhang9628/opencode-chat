import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  streamingMessageId: string | null
}

export default function MessageList({ messages, streamingMessageId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messages[messages.length - 1]?.content])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600">
        <p>输入一个话题，开始 AI 对话</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-2">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          allMessages={messages}
          isStreaming={msg.id === streamingMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
