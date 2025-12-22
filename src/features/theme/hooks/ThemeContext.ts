import { createContext } from 'react'
import type { Theme } from '../types'

/**
 * ThemeContextの値の型
 */
export type ThemeContextValue = {
  readonly theme: Theme
  readonly isDark: boolean
  readonly setTheme: (theme: Theme) => void
  readonly toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
