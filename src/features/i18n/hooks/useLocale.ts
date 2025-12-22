import { useContext } from 'react'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'

/**
 * ロケール関連の機能を使用するhook
 * @throws LocaleProvider外で使用された場合
 */
export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
