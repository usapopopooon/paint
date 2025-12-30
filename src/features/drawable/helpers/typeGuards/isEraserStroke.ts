import type { Drawable } from '../../types'

/**
 * 消しゴムストロークの型ガード
 * @param drawable - 判定する描画要素
 * @returns 消しゴムモードのストロークの場合はtrue
 */
export const isEraserStroke = (drawable: Drawable): boolean =>
  drawable.type === 'stroke' && drawable.style.blendMode === 'erase'
