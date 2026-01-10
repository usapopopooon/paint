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
 * 座標を垂直方向に反転
 * @param point - 元の座標
 * @param canvasHeight - キャンバスの高さ
 * @returns 反転後の座標
 */
const flipPointVertical = (point: Point, canvasHeight: number): Point => ({
  x: point.x,
  y: canvasHeight - point.y,
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
        scaleX: drawable.scaleX * -1,
      }
  }
}

/**
 * 描画要素を垂直方向に反転
 * @param drawable - 描画要素
 * @param canvasHeight - キャンバスの高さ
 * @returns 反転後の描画要素
 */
export const flipDrawableVertical = (drawable: Drawable, canvasHeight: number): Drawable => {
  switch (drawable.type) {
    case 'stroke':
      return {
        ...drawable,
        points: drawable.points.map((point) => flipPointVertical(point, canvasHeight)),
      }
    case 'image':
      return {
        ...drawable,
        y: canvasHeight - drawable.y - drawable.height,
        scaleY: drawable.scaleY * -1,
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

/**
 * 複数の描画要素を垂直方向に反転
 * @param drawables - 描画要素の配列
 * @param canvasHeight - キャンバスの高さ
 * @returns 反転後の描画要素の配列
 */
export const flipDrawablesVertical = (
  drawables: readonly Drawable[],
  canvasHeight: number
): readonly Drawable[] => {
  return drawables.map((drawable) => flipDrawableVertical(drawable, canvasHeight))
}
