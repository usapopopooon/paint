import { z } from 'zod'

/**
 * ファイル名の最大文字数
 * macOS/Windows共に255文字制限
 * .usapo拡張子（6文字）を引いて249文字
 */
export const MAX_FILE_NAME_LENGTH = 249

/** ファイル名に使用できない文字 */
const INVALID_CHARS = /[<>:"/\\|?*]/

/** コントロール文字をチェック */
const hasControlChars = (value: string): boolean =>
  value.split('').some((char) => char.charCodeAt(0) < 32)

/**
 * ファイル名のスキーマ
 * - 空でないこと
 * - 249文字以内（拡張子を含めて255文字以内）
 * - ファイルシステムで使用できない文字を含まないこと
 */
export const fileNameSchema = z
  .string()
  .min(1)
  .max(MAX_FILE_NAME_LENGTH)
  .refine((value) => !INVALID_CHARS.test(value) && !hasControlChars(value), {
    message: 'invalidCharacters',
  })
