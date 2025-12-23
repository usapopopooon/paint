import type { StrokeStyle } from '@/features/brush'
import type { Point } from '@/lib/geometry'

// 便宜上libからPointを再エクスポート
export type { Point } from '@/lib/geometry'

/**
 * 描画要素のユニーク識別子
 */
export type DrawableId = string

/**
 * 全描画要素に共通のメタデータ
 */
export type DrawableMetadata = {
  readonly id: DrawableId
  readonly createdAt: number
}

/**
 * ストローク描画要素 - フリーハンド描画
 */
export type StrokeDrawable = DrawableMetadata & {
  readonly type: 'stroke'
  readonly points: readonly Point[]
  readonly style: StrokeStyle
}

// 将来の描画要素タイプ（ドキュメント用にコメント）
// export type FillDrawable = DrawableMetadata & {
//   readonly type: 'fill'
//   readonly region: readonly Point[]
//   readonly color: string
// }
//
// export type BezierDrawable = DrawableMetadata & {
//   readonly type: 'bezier'
//   readonly controlPoints: readonly Point[]
//   readonly style: StrokeStyle
// }
//
// export type ShapeDrawable = DrawableMetadata & {
//   readonly type: 'shape'
//   readonly shapeType: 'rect' | 'ellipse' | 'line' | 'polygon'
//   readonly bounds: { x: number; y: number; width: number; height: number }
//   readonly style: ShapeStyle
// }
//
// export type ImageDrawable = DrawableMetadata & {
//   readonly type: 'image'
//   readonly src: string
//   readonly bounds: { x: number; y: number; width: number; height: number }
// }

/**
 * 全描画要素のユニオン型
 * 現在はStrokeDrawableのみだが、将来の拡張を考慮した設計
 */
export type Drawable = StrokeDrawable
// 将来: | FillDrawable | BezierDrawable | ShapeDrawable | ImageDrawable
