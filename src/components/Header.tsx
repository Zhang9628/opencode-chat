interface HeaderProps {
  currentRound: number
  maxRounds: number
  isDiscussing: boolean
  onStop: () => void
}

export default function Header({ currentRound, maxRounds, isDiscussing, onStop }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
      <h1 className="text-lg font-semibold text-gray-100">OpenCode Chat</h1>
      {isDiscussing && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            轮数: <span className="text-gray-200 font-mono">{currentRound}/{maxRounds}</span>
          </span>
          <button
            onClick={onStop}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
          >
            ⏹ 停止
          </button>
        </div>
      )}
    </header>
  )
}
