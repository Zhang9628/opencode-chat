import type { Message, Role } from '../types'

interface ReplyTagProps {
  replyToId: string | null
  messages: Message[]
}

const ROLE_LABELS: Record<Role, string> = {
  user: 'You',
  'ai-a': 'AI-A',
  'ai-b': 'AI-B',
}

export default function ReplyTag({ replyToId, messages }: ReplyTagProps) {
  if (!replyToId) return null

  const target = messages.find((m) => m.id === replyToId)
  if (!target) return null

  return (
    <span className="text-xs text-gray-500">
      ↩ 回复 {ROLE_LABELS[target.role]}
    </span>
  )
}
