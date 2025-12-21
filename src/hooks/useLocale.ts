import { useCallback, useEffect, useState } from 'react'

export type Locale = 'en' | 'ja'

const STORAGE_KEY = 'locale'

const translations = {
  en: {
    pen: 'Pen',
    eraser: 'Eraser',
    undo: 'Undo',
    redo: 'Redo',
    clear: 'Clear',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    switchLanguage: 'Switch language',
    undoShortcut: 'Ctrl+Z',
    redoShortcut: 'Ctrl+Shift+Z',
    clearShortcut: 'Shift+Delete',
    noUndoHistory: 'No undo history',
    noRedoHistory: 'No redo history',
    copyColor: 'Copy',
    pasteColor: 'Paste',
  },
  ja: {
    pen: 'ペン',
    eraser: '消しゴム',
    undo: '元に戻す',
    redo: 'やり直す',
    clear: 'クリア',
    lightMode: 'ライトモード',
    darkMode: 'ダークモード',
    switchLanguage: '言語を切り替える',
    undoShortcut: 'Ctrl+Z',
    redoShortcut: 'Ctrl+Shift+Z',
    clearShortcut: 'Shift+Delete',
    noUndoHistory: '履歴がありません',
    noRedoHistory: '履歴がありません',
    copyColor: 'コピー',
    pasteColor: 'ペースト',
  },
} as const

export type TranslationKey = keyof (typeof translations)['en']

const getInitialLocale = (): Locale => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ja') {
    return stored
  }
  // Check browser language
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('ja') ? 'ja' : 'en'
}

export const useLocale = () => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'ja' : 'en'))
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key]
    },
    [locale]
  )

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
  } as const
}
