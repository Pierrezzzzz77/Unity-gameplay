import { create } from 'zustand'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'monta3d:theme'
const MUTED_KEY = 'monta3d:muted'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* preferências são só conveniência; ignorar falhas de armazenamento */
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface UiState {
  theme: Theme
  muted: boolean
  toggleTheme: () => void
  toggleMuted: () => void
}

export const useUiStore = create<UiState>()((set, get) => ({
  theme: read(THEME_KEY) === 'light' ? 'light' : 'dark',
  muted: read(MUTED_KEY) === '1',
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(theme)
    write(THEME_KEY, theme)
    set({ theme })
  },
  toggleMuted: () => {
    const muted = !get().muted
    write(MUTED_KEY, muted ? '1' : '0')
    set({ muted })
  },
}))
