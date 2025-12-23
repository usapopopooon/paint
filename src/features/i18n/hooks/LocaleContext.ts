import { createContext } from 'react'
import type { Locale } from '../types'
import type { TranslateFunction } from '../infrastructure'

/**
 * LocaleContextの値の型
 */
export type LocaleContextValue = {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly toggleLocale: () => void
  readonly t: TranslateFunction
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
