import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setStorageItem } from '@/lib/storage'
import type { Locale } from '../types'
import { LOCALE_STORAGE_KEY } from '../constants'
import { getTranslation, type TranslationKey, type TranslateFunction } from '../infrastructure'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'
import { getInitialLocale } from '../helpers'

/**
 * LocaleProviderコンポーネントのプロパティ
 */
type LocaleProviderProps = {
  readonly children: ReactNode
  readonly defaultLocale?: Locale
}

/**
 * ロケールを管理するProviderコンポーネント
 * @param props - LocaleProviderコンポーネントのプロパティ
 */
export const LocaleProvider = ({ children, defaultLocale }: LocaleProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale ?? getInitialLocale)

  // ロケール変更時にLocalStorageに保存
  useEffect(() => {
    setStorageItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  /**
   * ロケールを設定
   * @param newLocale - 新しいロケール
   */
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  /** 英語/日本語を切り替え */
  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'ja' : 'en'))
  }, [])

  /**
   * 翻訳関数
   * @param key - 翻訳キー
   * @returns 現在のロケールに対応する翻訳テキスト
   */
  const t = useCallback<TranslateFunction>(
    (key: TranslationKey) => getTranslation(locale, key),
    [locale]
  )

  /** Context valueをメモ化（子コンポーネントの不要な再レンダリングを防ぐ） */
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
