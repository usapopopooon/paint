import { translations, type TranslationKey } from '@/features/i18n'

export const mockT = (key: TranslationKey): string => {
  return translations.en[key]
}
