import { PART_IDS, PARTS } from '../data/parts'
import { stepNumberOfPart } from '../data/steps'
import { playSound } from '../lib/sound'
import { useAssemblyStore } from '../store/assemblyStore'
import type { PartId } from '../types'

function PartCard({ id }: { id: PartId }) {
  const def = PARTS[id]
  const selected = useAssemblyStore((s) => s.selectedPart === id)
  const locked = useAssemblyStore((s) => s.placingPart !== null)
  const selectPart = useAssemblyStore((s) => s.selectPart)
  const step = stepNumberOfPart(id)

  return (
    <li>
      <button
        type="button"
        data-part-card={id}
        aria-pressed={selected}
        disabled={locked}
        onClick={() => {
          if (!selected) playSound('select')
          selectPart(id)
        }}
        className={`group focus-visible:outline-accent flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${
          selected
            ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_var(--color-accent),0_0_22px_-6px_var(--color-accent)]'
            : 'border-line bg-panel-2 hover:border-accent/50 hover:bg-accent/5'
        }`}
      >
        <span
          aria-hidden="true"
          className="size-9 shrink-0 rounded-md border border-white/10 shadow-inner"
          style={{
            background: `linear-gradient(135deg, ${def.swatch}, color-mix(in oklab, ${def.swatch} 55%, black))`,
          }}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-fg truncate text-sm font-medium">{def.name}</span>
            {step !== null && (
              <span className="text-muted shrink-0 font-mono text-[10px]">passo {step}</span>
            )}
          </span>
          <span className="text-muted line-clamp-2 text-xs leading-snug">{def.description}</span>
        </span>
      </button>
    </li>
  )
}

/** Peças que ainda estão na bancada, prontas para serem selecionadas. */
export function PartTray() {
  const available = useAssemblyStore((s) =>
    PART_IDS.filter((id) => s.parts[id].status === 'available').join(','),
  )
  const ids = available ? (available.split(',') as PartId[]) : []

  return (
    <section aria-label="Peças disponíveis" className="space-y-2.5">
      <h3 className="text-muted font-mono text-[11px] tracking-[0.14em] uppercase">
        Bandeja de peças · {ids.length}
      </h3>
      {ids.length === 0 ? (
        <p className="border-line text-muted rounded-lg border border-dashed px-3 py-2.5 text-sm">
          Todas as peças já estão na placa.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {ids.map((id) => (
            <PartCard key={id} id={id} />
          ))}
        </ul>
      )}
    </section>
  )
}
