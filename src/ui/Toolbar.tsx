import { useAssemblyStore } from '../store/assemblyStore'
import { useUiStore } from '../store/uiStore'
import { MoonIcon, MuteIcon, ResetIcon, SoundIcon, SunIcon } from './icons'

export function Toolbar() {
  const reset = useAssemblyStore((s) => s.reset)
  const placing = useAssemblyStore((s) => s.placingPart !== null)
  const { theme, muted, toggleTheme, toggleMuted } = useUiStore()

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={reset} disabled={placing} className="btn btn-ghost flex-1">
        <ResetIcon className="text-base" /> Reiniciar montagem
      </button>
      <button
        type="button"
        onClick={toggleMuted}
        className="btn btn-ghost btn-icon"
        aria-pressed={!muted}
        aria-label={muted ? 'Ativar sons' : 'Silenciar sons'}
        title={muted ? 'Ativar sons' : 'Silenciar sons'}
      >
        {muted ? <MuteIcon /> : <SoundIcon />}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-ghost btn-icon"
        aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
        title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
