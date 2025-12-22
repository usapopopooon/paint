import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { Theme } from '../types'
import { ALLOWED_THEMES, THEME_STORAGE_KEY } from '../types'

/**
 * ThemeContextの値の型
 */
type ThemeContextValue = {
  readonly theme: Theme
  readonly isDark: boolean
  readonly setTheme: (theme: Theme) => void
  readonly toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * 初期テーマを取得
 * 優先順位: LocalStorage > システム設定 > デフォルト(light)
 */
const getInitialTheme = (): Theme => {
  const stored = getStorageItem(THEME_STORAGE_KEY, ALLOWED_THEMES)
  if (stored) return stored

  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type ThemeProviderProps = {
  readonly children: ReactNode
  readonly defaultTheme?: Theme
}

/**
 * テーマを管理するProvider
 */
export const ThemeProvider = ({ children, defaultTheme }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme ?? getInitialTheme)

  // テーマ変更時にDOMクラスとLocalStorageを更新
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setStorageItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  // メモ化されたsetTheme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  // メモ化されたトグル関数
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Context valueをメモ化（子コンポーネントの不要な再レンダリングを防ぐ）
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * テーマ関連の機能を使用するhook
 * @throws ThemeProvider外で使用された場合
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
