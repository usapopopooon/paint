import type { Drawable, Point } from '../../types'

/**
 * 座標をオフセット分移動
 * @param point - 元の座標
 * @param offsetX - X方向のオフセット
 * @param offsetY - Y方向のオフセット
 * @returns 移動後の座標
 */
const translatePoint = (point: Point, offsetX: number, offsetY: number): Point => ({
  x: point.x + offsetX,
  y: point.y + offsetY,
})

/**
 * 描画要素の座標をオフセット分移動
 * @param drawable - 描画要素
 * @param offsetX - X方向のオフセット
 * @param offsetY - Y方向のオフセット
 * @returns 座標移動後の描画要素
 */
export const translateDrawable = (
  drawable: Drawable,
  offsetX: number,
  offsetY: number
): Drawable => {
  switch (drawable.type) {
    case 'stroke':
      return {
        ...drawable,
        points: drawable.points.map((point) => translatePoint(point, offsetX, offsetY)),
      }
    case 'image':
      return {
        ...drawable,
        x: drawable.x + offsetX,
        y: drawable.y + offsetY,
      }
  }
}

/**
 * 複数の描画要素の座標をオフセット分移動
 * @param drawables - 描画要素の配列
 * @param offsetX - X方向のオフセット
 * @param offsetY - Y方向のオフセット
 * @returns 座標移動後の描画要素の配列
 */
export const translateDrawables = (
  drawables: readonly Drawable[],
  offsetX: number,
  offsetY: number
): readonly Drawable[] => {
  if (offsetX === 0 && offsetY === 0) return drawables
  return drawables.map((drawable) => translateDrawable(drawable, offsetX, offsetY))
}
