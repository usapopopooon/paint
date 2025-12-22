import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

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
