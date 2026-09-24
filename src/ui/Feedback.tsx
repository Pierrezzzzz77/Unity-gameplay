import { useEffect } from 'react'
import { useAssemblyStore } from '../store/assemblyStore'
import type { FeedbackKind } from '../store/assemblyStore'
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './icons'

const DURATION: Record<FeedbackKind, number> = { success: 2800, info: 2800, error: 4800 }

const STYLE: Record<FeedbackKind, string> = {
  success: 'border-ok/40 text-ok',
  error: 'border-err/50 text-err',
  info: 'border-accent/40 text-accent',
}

const ICON = { success: CheckIcon, error: AlertIcon, info: InfoIcon } as const

/** Toast não bloqueante: aparece no topo da cena e some sozinho. */
export function Feedback() {
  const feedback = useAssemblyStore((s) => s.feedback)
  const dismiss = useAssemblyStore((s) => s.dismissFeedback)

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => dismiss(feedback.id), DURATION[feedback.kind])
    return () => window.clearTimeout(timer)
  }, [feedback, dismiss])

  const Icon = feedback ? ICON[feedback.kind] : null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-4"
    >
      {feedback && (
        <div
          key={feedback.id}
          className={`toast-in bg-panel/90 pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl border py-2.5 pr-2 pl-3 shadow-xl shadow-black/30 backdrop-blur-md ${STYLE[feedback.kind]}`}
        >
          {Icon && <Icon className="mt-0.5 shrink-0 text-base" />}
          <p className="text-fg text-sm leading-snug">{feedback.message}</p>
          <button
            type="button"
            onClick={() => dismiss(feedback.id)}
            aria-label="Fechar mensagem"
            className="text-muted hover:text-fg focus-visible:outline-accent shrink-0 rounded p-0.5 focus-visible:outline-2"
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  )
}
