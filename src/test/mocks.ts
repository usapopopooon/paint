import { translations, type TranslationKey } from '@/hooks/useLocale'

export const mockT = (key: TranslationKey): string => {
  return translations.en[key]
}
