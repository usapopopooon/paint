import { z } from 'zod'

/**
 * ポイントスキーマ
 */
const pointSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    pressure: z.number().optional(),
  })
  .readonly()

/**
 * ブラシチップタイプスキーマ
 */
const brushTipTypeSchema = z.enum(['solid', 'soft', 'airbrush'])

/**
 * ブレンドモードスキーマ（ストローク用）
 */
const strokeBlendModeSchema = z.enum(['normal', 'erase'])

/**
 * ブラシチップスキーマ
 */
const brushTipSchema = z
  .object({
    type: brushTipTypeSchema,
    size: z.number(),
    hardness: z.number().min(0).max(1),
    opacity: z.number().min(0).max(1),
  })
  .readonly()

/**
 * ストロークスタイルスキーマ
 */
const strokeStyleSchema = z
  .object({
    color: z.string(),
    brushTip: brushTipSchema,
    blendMode: strokeBlendModeSchema,
  })
  .readonly()

/**
 * ストローク描画要素スキーマ
 */
const strokeDrawableSchema = z
  .object({
    id: z.string(),
    createdAt: z.number(),
    type: z.literal('stroke'),
    points: z.array(pointSchema).readonly(),
    style: strokeStyleSchema,
  })
  .readonly()

/**
 * 画像描画要素スキーマ
 */
const imageDrawableSchema = z
  .object({
    id: z.string(),
    createdAt: z.number(),
    type: z.literal('image'),
    src: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    scaleX: z.number(),
  })
  .readonly()

/**
 * 描画要素スキーマ（ユニオン）
 */
const drawableSchema = z.discriminatedUnion('type', [strokeDrawableSchema, imageDrawableSchema])

/**
 * レイヤータイプスキーマ
 */
const layerTypeSchema = z.enum(['background', 'drawing'])

/**
 * レイヤーブレンドモードスキーマ
 */
const layerBlendModeSchema = z.enum([
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
])

/**
 * レイヤースキーマ
 */
const layerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: layerTypeSchema,
    isVisible: z.boolean(),
    isLocked: z.boolean(),
    opacity: z.number().min(0).max(1),
    blendMode: layerBlendModeSchema,
    drawables: z.array(drawableSchema).readonly(),
  })
  .readonly()

/**
 * プロジェクトファイルスキーマ
 */
export const projectFileSchema = z
  .object({
    version: z.number().int().positive(),
    name: z.string().min(1),
    canvasWidth: z.number().int().positive(),
    canvasHeight: z.number().int().positive(),
    layers: z.array(layerSchema).min(1).readonly(),
    activeLayerId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .readonly()

/**
 * Zodスキーマから推論したプロジェクトファイル型
 */
export type ProjectFile = z.infer<typeof projectFileSchema>

/**
 * Zodスキーマから推論したレイヤー型
 */
export type ProjectLayer = z.infer<typeof layerSchema>

/**
 * Zodスキーマから推論した描画要素型
 */
export type ProjectDrawable = z.infer<typeof drawableSchema>

/**
 * プロジェクトファイルのパース結果
 */
export type ParseProjectResult =
  | { readonly success: true; readonly data: ProjectFile }
  | { readonly success: false; readonly error: z.ZodError }

/**
 * プロジェクトファイルをパース・バリデーション
 */
export const parseProjectFile = (data: unknown): ParseProjectResult => {
  const result = projectFileSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}
