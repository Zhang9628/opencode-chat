import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ComponentPropsWithoutRef } from 'react'

interface MarkdownBodyProps {
  content: string
}

export default function MarkdownBody({ content }: MarkdownBodyProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none break-words">
      <ReactMarkdown
        components={{
          code(props: ComponentPropsWithoutRef<'code'>) {
            const { children, className, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            const inline = !match
            return inline ? (
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...rest}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: '0.5rem 0', borderRadius: '0.375rem', fontSize: '0.8rem' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
