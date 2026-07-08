import { useRef, useState, type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function Pre(props: ComponentPropsWithoutRef<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const text = ref.current?.innerText ?? ''
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="group relative">
      <button
        onClick={copy}
        className="absolute right-2 top-2 z-10 rounded-md bg-slate-700/70 px-2 py-1 text-[11px] font-medium text-slate-100 opacity-0 transition group-hover:opacity-100 hover:bg-slate-600"
        aria-label="Copy code"
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
      <pre ref={ref} {...props} />
    </div>
  )
}

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-app">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: Pre }}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
