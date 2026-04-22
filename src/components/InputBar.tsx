import { useState, type KeyboardEvent } from 'react'

interface InputBarProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 shrink-0">
      <div className="flex gap-3 max-w-4xl mx-auto">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入话题或插话..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          发送 ▶
        </button>
      </div>
    </div>
  )
}
