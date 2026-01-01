import { useEffect, useMemo, type ReactNode } from 'react'
import { I18nProvider, useLocale as useBfLocale } from '@bf-i18n/react'
import { createI18n } from '@bf-i18n/core'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { Locale } from '../types'
import { ALLOWED_LOCALES, LOCALE_STORAGE_KEY } from '../constants'
import en from '../infrastructure/locales/en.json'
import ja from '../infrastructure/locales/ja.json'

/**
 * i18nインスタンスを作成
 * ライブラリがブラウザのロケール検出とフォールバックを自動で行う
 */
const createI18nInstance = (storedLocale: Locale | null) =>
  createI18n({
    defaultLocale: 'en',
    locale: storedLocale ?? undefined,
    translations: { en, ja },
    detectBrowserLocale: !storedLocale,
  })

type LocaleProviderProps = {
  readonly children: ReactNode
  readonly defaultLocale?: Locale
}

/**
 * ロケール変更時にLocalStorageに保存するコンポーネント
 */
const LocaleStorageSync = ({ children }: { children: ReactNode }) => {
  const { locale } = useBfLocale()

  useEffect(() => {
    setStorageItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  return <>{children}</>
}

/**
 * ロケールを管理するProviderコンポーネント
 * @bf-i18n/reactを使用
 */
export const LocaleProvider = ({ children, defaultLocale }: LocaleProviderProps) => {
  const storedLocale = defaultLocale ?? getStorageItem(LOCALE_STORAGE_KEY, ALLOWED_LOCALES)
  const i18n = useMemo(() => createI18nInstance(storedLocale), [storedLocale])

  return (
    <I18nProvider i18n={i18n}>
      <LocaleStorageSync>{children}</LocaleStorageSync>
    </I18nProvider>
  )
}
