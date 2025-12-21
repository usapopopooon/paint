import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Locale = 'en' | 'ja'

const STORAGE_KEY = 'locale'

export const translations = {
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

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ja') {
    return stored
  }
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('ja') ? 'ja' : 'en'
}

type LocaleProviderProps = {
  readonly children: ReactNode
  readonly defaultLocale?: Locale
}

export const LocaleProvider = ({ children, defaultLocale }: LocaleProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale ?? getInitialLocale)

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

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
