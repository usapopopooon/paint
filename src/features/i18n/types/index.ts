import { ALLOWED_LOCALES } from '../constants'

/**
 * サポートするロケール
 */
export type Locale = (typeof ALLOWED_LOCALES)[number]
