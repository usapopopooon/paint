import { useCallback, useEffect, useState } from 'react'
import { getStorageItem, setStorageItem } from '@/lib/storage'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const ALLOWED_THEMES = ['light', 'dark'] as const

const getInitialTheme = (): Theme => {
  const stored = getStorageItem(STORAGE_KEY, ALLOWED_THEMES)
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setStorageItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  } as const
}
