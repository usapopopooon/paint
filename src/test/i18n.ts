import { createI18n } from '@bf-i18n/core'
import en from '@/features/i18n/infrastructure/locales/en.json'
import ja from '@/features/i18n/infrastructure/locales/ja.json'

/**
 * テスト・ストーリー用の英語i18nインスタンス
 */
export const i18nEn = createI18n({
  defaultLocale: 'en',
  locale: 'en',
  translations: { en, ja },
})

/**
 * テスト・ストーリー用の日本語i18nインスタンス
 */
export const i18nJa = createI18n({
  defaultLocale: 'ja',
  locale: 'ja',
  translations: { en, ja },
})
