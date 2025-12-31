import type { Drawable, ImageDrawable } from '../../types'

/**
 * ImageDrawableの型ガード
 * @param drawable - 判定する描画要素
 * @returns ImageDrawableの場合はtrue
 */
export const isImageDrawable = (drawable: Drawable): drawable is ImageDrawable =>
  drawable.type === 'image'
