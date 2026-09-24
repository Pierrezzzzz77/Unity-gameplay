import { useEffect, useState } from 'react'
import { Scene } from './scene/Scene'
import { selectCurrentStep, useAssemblyStore } from './store/assemblyStore'
import { CompletionBanner } from './ui/CompletionBanner'
import { Feedback } from './ui/Feedback'
import { ChevronIcon, LogoMark } from './ui/icons'
import { PartTray } from './ui/PartTray'
import { StepHeader, StepPanel } from './ui/StepPanel'
import { Toolbar } from './ui/Toolbar'

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      const { rotateSelected, selectPart, attemptPlacement, selectedPart } =
        useAssemblyStore.getState()
      if (e.key === 'r' || e.key === 'R') {
        rotateSelected(e.shiftKey ? -1 : 1)
      } else if (e.key === 'Escape') {
        selectPart(null)
      } else if (e.key === 'Enter' && selectedPart) {
        // Enter encaixa a peça selecionada, inclusive com o foco no card da bandeja
        // (senão o Enter "clicaria" o card e desfaria a seleção). Outros botões seguem normais.
        const onOtherControl = target?.closest('button, a') && !target.closest('[data-part-card]')
        if (onOtherControl) return
        e.preventDefault()
        attemptPlacement()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

export default function App() {
  useKeyboardShortcuts()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const step = useAssemblyStore(selectCurrentStep)

  return (
    <div className="bg-surface text-fg flex h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <main className="relative min-h-0 flex-1">
        <Scene />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
          <a
            href="../"
            className="border-line bg-panel/70 hover:border-accent/50 pointer-events-auto flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2.5 text-sm font-semibold backdrop-blur-md"
          >
            <LogoMark className="text-accent text-lg" />
            <span>
              Monta<span className="text-muted">.3D</span>
            </span>
          </a>
          <p className="border-line bg-panel/60 text-muted hidden rounded-full border px-3 py-1.5 font-mono text-[11px] backdrop-blur-md sm:block">
            arraste para girar · role para zoom · botão direito para mover
          </p>
        </header>

        <Feedback />
        <CompletionBanner />
      </main>

      <aside
        aria-label="Painel de montagem"
        className="border-line bg-panel relative z-20 flex max-h-[55dvh] shrink-0 flex-col border-t shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.45)] lg:max-h-none lg:w-[380px] lg:border-t-0 lg:border-l lg:shadow-none"
      >
        <button
          type="button"
          onClick={() => setDrawerOpen((open) => !open)}
          aria-expanded={drawerOpen}
          aria-controls="assembly-drawer"
          className="text-muted flex w-full items-center justify-between gap-3 px-4 pt-2 pb-1 text-xs lg:hidden"
        >
          <span className="bg-line mx-auto h-1 w-10 rounded-full" aria-hidden="true" />
          <span className="sr-only">{drawerOpen ? 'Recolher painel' : 'Expandir painel'}</span>
          <ChevronIcon
            className={`absolute right-4 text-base transition-transform ${drawerOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div className="px-4 pt-2 pb-3 lg:px-5 lg:pt-5">
          <StepHeader />
          {!drawerOpen && step && (
            <p className="text-muted mt-2 line-clamp-1 text-xs lg:hidden">{step.instruction}</p>
          )}
        </div>

        <div
          id="assembly-drawer"
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 lg:block lg:px-5 ${drawerOpen ? 'block' : 'hidden'}`}
        >
          <div className="space-y-6">
            <StepPanel />
            <PartTray />
          </div>
        </div>

        <div
          className={`border-line border-t px-4 py-3 lg:block lg:px-5 ${drawerOpen ? 'block' : 'hidden'}`}
        >
          <Toolbar />
        </div>
      </aside>
    </div>
  )
}
