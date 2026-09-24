import { PARTS } from '../data/parts'
import { STEPS } from '../data/steps'
import { selectCurrentStep, selectIsComplete, useAssemblyStore } from '../store/assemblyStore'
import { CheckIcon, ResetIcon, RotateIcon, TargetIcon } from './icons'

export function ProgressBar() {
  const currentStepIndex = useAssemblyStore((s) => s.currentStepIndex)
  const placing = useAssemblyStore((s) => s.placingPart !== null)
  const done = Math.min(currentStepIndex, STEPS.length)
  return (
    <div
      className="flex gap-1.5"
      role="progressbar"
      aria-label="Progresso da montagem"
      aria-valuemin={0}
      aria-valuemax={STEPS.length}
      aria-valuenow={done}
    >
      {STEPS.map((step, i) => (
        <span
          key={step.id}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
            i < done
              ? 'bg-accent'
              : i === done
                ? placing
                  ? 'bg-accent/70'
                  : 'bg-accent/35 animate-pulse'
                : 'bg-line'
          }`}
        />
      ))}
    </div>
  )
}

export function StepHeader() {
  const step = useAssemblyStore(selectCurrentStep)
  const index = useAssemblyStore((s) => s.currentStepIndex)
  const complete = useAssemblyStore(selectIsComplete)
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-muted font-mono text-[11px] tracking-[0.14em] uppercase">
          {complete ? 'Concluído' : `Etapa ${index + 1} de ${STEPS.length}`}
        </p>
        <p className="text-muted font-mono text-[11px] tabular-nums">
          {Math.round((Math.min(index, STEPS.length) / STEPS.length) * 100)}%
        </p>
      </div>
      <ProgressBar />
      <h2 className="text-fg text-lg leading-tight font-semibold">
        {complete ? 'Montagem concluída' : step?.title}
      </h2>
    </div>
  )
}

function SelectionActions() {
  const selectedPart = useAssemblyStore((s) => s.selectedPart)
  const quarterTurns = useAssemblyStore((s) =>
    s.selectedPart ? s.parts[s.selectedPart].quarterTurns : 0,
  )
  const rotateSelected = useAssemblyStore((s) => s.rotateSelected)
  const attemptPlacement = useAssemblyStore((s) => s.attemptPlacement)
  const selectPart = useAssemblyStore((s) => s.selectPart)

  if (!selectedPart) {
    return (
      <p className="border-line text-muted rounded-lg border border-dashed px-3 py-2.5 text-sm">
        Selecione uma peça na bandeja ou clique nela na bancada.
      </p>
    )
  }

  const canRotate = selectedPart === 'processor'
  const degrees = ((((quarterTurns % 4) + 4) % 4) * 90).toString()

  return (
    <div className="border-accent/40 bg-accent/8 space-y-2.5 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-fg text-sm">
          <span className="text-muted">Selecionado: </span>
          <strong className="font-semibold">{PARTS[selectedPart].name}</strong>
        </p>
        <button
          type="button"
          onClick={() => selectPart(null)}
          className="text-muted hover:text-fg focus-visible:outline-accent rounded px-1.5 py-0.5 text-xs focus-visible:outline-2"
        >
          Cancelar <kbd className="ml-0.5 font-mono text-[10px] opacity-70">Esc</kbd>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => attemptPlacement()} className="btn btn-primary flex-1">
          <TargetIcon className="text-base" /> Encaixar
          <kbd className="font-mono text-[10px] opacity-70">Enter</kbd>
        </button>
        {canRotate && (
          <button
            type="button"
            onClick={() => rotateSelected(1)}
            className="btn btn-ghost flex-1"
            aria-label={`Girar processador 90 graus (atual: ${degrees} graus)`}
          >
            <RotateIcon className="text-base" /> Girar 90°
            <kbd className="font-mono text-[10px] opacity-70">R</kbd>
          </button>
        )}
      </div>
      {canRotate && (
        <p className="text-muted font-mono text-[11px]">
          Rotação atual: <span className="text-fg tabular-nums">{degrees}°</span>
        </p>
      )}
    </div>
  )
}

function StepList() {
  const currentStepIndex = useAssemblyStore((s) => s.currentStepIndex)
  return (
    <ol className="space-y-1">
      {STEPS.map((step, i) => {
        const state = i < currentStepIndex ? 'done' : i === currentStepIndex ? 'current' : 'todo'
        return (
          <li
            key={step.id}
            aria-current={state === 'current' ? 'step' : undefined}
            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm ${
              state === 'current'
                ? 'bg-accent/10 text-fg'
                : state === 'done'
                  ? 'text-fg/80'
                  : 'text-muted'
            }`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${
                state === 'done'
                  ? 'border-ok bg-ok/15 text-ok'
                  : state === 'current'
                    ? 'border-accent text-accent'
                    : 'border-line'
              }`}
            >
              {state === 'done' ? <CheckIcon /> : i + 1}
            </span>
            <span className={state === 'done' ? 'decoration-muted/60 line-through' : undefined}>
              {step.title}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function StepPanel() {
  const step = useAssemblyStore(selectCurrentStep)
  const complete = useAssemblyStore(selectIsComplete)
  const mistakes = useAssemblyStore((s) => s.mistakes)
  const reset = useAssemblyStore((s) => s.reset)

  return (
    <section aria-label="Etapa atual" className="space-y-5">
      {complete ? (
        <div className="border-ok/40 bg-ok/10 space-y-3 rounded-lg border p-3.5">
          <p className="text-ok flex items-center gap-2 font-semibold">
            <CheckIcon className="text-lg" /> Todas as 5 etapas concluídas
          </p>
          <p className="text-fg/85 text-sm">
            Processador instalado, refrigeração no lugar e cooler girando.{' '}
            {mistakes === 0
              ? 'Sem nenhum erro de encaixe!'
              : `${mistakes} ${mistakes === 1 ? 'tentativa recusada' : 'tentativas recusadas'} no caminho.`}
          </p>
          <button type="button" onClick={reset} className="btn btn-primary w-full">
            <ResetIcon className="text-base" /> Montar novamente
          </button>
        </div>
      ) : (
        step && (
          <div className="space-y-3">
            <p className="text-fg/90 text-sm leading-relaxed">{step.instruction}</p>
            <p className="border-accent/50 text-muted border-l-2 pl-2.5 text-xs leading-relaxed">
              {step.hint}
            </p>
            <SelectionActions />
          </div>
        )
      )}
      <StepList />
    </section>
  )
}
