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
import type { Locale } from '../types'
import { ALLOWED_LOCALES, LOCALE_STORAGE_KEY } from '../types'
import { getTranslation, type TranslationKey, type TranslateFunction } from '../locales'

/**
 * LocaleContextの値の型
 */
type LocaleContextValue = {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly toggleLocale: () => void
  readonly t: TranslateFunction
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

/**
 * 初期ロケールを取得
 * 優先順位: LocalStorage > ブラウザ設定 > デフォルト(en)
 */
const getInitialLocale = (): Locale => {
  const stored = getStorageItem(LOCALE_STORAGE_KEY, ALLOWED_LOCALES)
  if (stored) return stored

  if (typeof window === 'undefined') return 'en'

  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('ja') ? 'ja' : 'en'
}

type LocaleProviderProps = {
  readonly children: ReactNode
  readonly defaultLocale?: Locale
}

/**
 * ロケールを管理するProvider
 */
export const LocaleProvider = ({ children, defaultLocale }: LocaleProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale ?? getInitialLocale)

  // ロケール変更時にLocalStorageに保存
  useEffect(() => {
    setStorageItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  // メモ化されたsetLocale
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  // メモ化されたトグル関数
  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'ja' : 'en'))
  }, [])

  // メモ化された翻訳関数
  const t = useCallback<TranslateFunction>(
    (key: TranslationKey) => getTranslation(locale, key),
    [locale]
  )

  // Context valueをメモ化（子コンポーネントの不要な再レンダリングを防ぐ）
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

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
