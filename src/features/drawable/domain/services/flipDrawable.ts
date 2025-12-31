import type { Drawable, Point } from '../../types'

/**
 * 座標を水平方向に反転
 * @param point - 元の座標
 * @param canvasWidth - キャンバスの幅
 * @returns 反転後の座標
 */
const flipPointHorizontal = (point: Point, canvasWidth: number): Point => ({
  x: canvasWidth - point.x,
  y: point.y,
})

/**
 * 描画要素を水平方向に反転
 * @param drawable - 描画要素
 * @param canvasWidth - キャンバスの幅
 * @returns 反転後の描画要素
 */
export const flipDrawableHorizontal = (drawable: Drawable, canvasWidth: number): Drawable => {
  switch (drawable.type) {
    case 'stroke':
      return {
        ...drawable,
        points: drawable.points.map((point) => flipPointHorizontal(point, canvasWidth)),
      }
    case 'image':
      return {
        ...drawable,
        x: canvasWidth - drawable.x - drawable.width,
      }
  }
}

/**
 * 複数の描画要素を水平方向に反転
 * @param drawables - 描画要素の配列
 * @param canvasWidth - キャンバスの幅
 * @returns 反転後の描画要素の配列
 */
export const flipDrawablesHorizontal = (
  drawables: readonly Drawable[],
  canvasWidth: number
): readonly Drawable[] => {
  return drawables.map((drawable) => flipDrawableHorizontal(drawable, canvasWidth))
}
