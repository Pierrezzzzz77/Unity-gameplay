import { selectIsComplete, useAssemblyStore } from '../store/assemblyStore'
import { CheckIcon, ResetIcon } from './icons'

/** Selo exibido sobre a cena quando as 5 etapas terminam. */
export function CompletionBanner() {
  const complete = useAssemblyStore(selectIsComplete)
  const reset = useAssemblyStore((s) => s.reset)
  if (!complete) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
      <div className="toast-in border-ok/40 bg-panel/90 pointer-events-auto flex items-center gap-3 rounded-2xl border py-2.5 pr-2.5 pl-4 shadow-2xl shadow-black/40 backdrop-blur-md">
        <span className="bg-ok/15 text-ok grid size-8 place-items-center rounded-full text-lg">
          <CheckIcon />
        </span>
        <div>
          <p className="text-fg text-sm font-semibold">Montagem concluída</p>
          <p className="text-muted text-xs">Placa, socket, CPU, dissipador e cooler no lugar.</p>
        </div>
        <button type="button" onClick={reset} className="btn btn-primary ml-2">
          <ResetIcon className="text-base" /> De novo
        </button>
      </div>
    </div>
  )
}
