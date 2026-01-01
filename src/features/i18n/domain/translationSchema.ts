import { z } from 'zod'

/**
 * 翻訳ファイルのスキーマ
 * key: string形式のオブジェクトであることを検証
 */
export const translationSchema = z.record(z.string(), z.string())

/**
 * Zodから推論された翻訳データ型
 */
export type TranslationData = z.infer<typeof translationSchema>

/**
 * 翻訳データの検証結果
 */
export type ParseTranslationResult =
  | { readonly success: true; readonly data: TranslationData }
  | { readonly success: false; readonly error: z.ZodError }

/**
 * 翻訳データを検証
 */
export const parseTranslation = (data: unknown): ParseTranslationResult => {
  const result = translationSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * 翻訳データを検証し、無効な場合はエラーをスロー
 */
export const validateTranslation = (data: unknown, localeName: string): TranslationData => {
  const result = translationSchema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    throw new Error(`Invalid translation data for locale "${localeName}":\n${issues.join('\n')}`)
  }
  return result.data
}
