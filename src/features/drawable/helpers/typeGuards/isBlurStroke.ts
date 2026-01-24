import type { Drawable } from '../../types'

/**
 * ぼかしストロークの型ガード
 * @param drawable - 判定する描画要素
 * @returns ぼかしモードのストロークの場合はtrue
 */
export const isBlurStroke = (drawable: Drawable): boolean =>
  drawable.type === 'stroke' && drawable.style.blendMode === 'blur'
