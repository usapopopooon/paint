import type { ResizeAnchor } from '../types'
import { getAnchorOffsetFactors } from './getAnchorOffsetFactors'

/**
 * サイズ変更時のオフセットを計算
 * @param anchor - リサイズの起点
 * @param deltaWidth - 幅の変化量
 * @param deltaHeight - 高さの変化量
 * @returns X方向とY方向のオフセット
 */
export const calculateResizeOffset = (
  anchor: ResizeAnchor,
  deltaWidth: number,
  deltaHeight: number
): { readonly offsetX: number; readonly offsetY: number } => {
  const { factorX, factorY } = getAnchorOffsetFactors(anchor)
  return {
    offsetX: deltaWidth * factorX,
    offsetY: deltaHeight * factorY,
  }
}
