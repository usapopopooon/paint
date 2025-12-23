import type { Drawable, StrokeDrawable } from '../../types'

/**
 * StrokeDrawableの型ガード
 * @param drawable - 判定する描画要素
 * @returns StrokeDrawableの場合はtrue
 */
export const isStrokeDrawable = (drawable: Drawable): drawable is StrokeDrawable =>
  drawable.type === 'stroke'
