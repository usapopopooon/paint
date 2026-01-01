import { z } from 'zod'

/**
 * レイヤー名の最大文字数
 */
export const MAX_LAYER_NAME_LENGTH = 50

/**
 * レイヤー名のスキーマ
 * - 空でないこと
 * - 50文字以内
 */
export const layerNameSchema = z.string().min(1).max(MAX_LAYER_NAME_LENGTH)
