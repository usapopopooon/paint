import { generateId } from '@/lib/id'
import type { CanvasResizedAction } from '../types/actions'

/**
 * キャンバスリサイズアクションを作成
 * @param previousWidth - 変更前の幅
 * @param previousHeight - 変更前の高さ
 * @param newWidth - 変更後の幅
 * @param newHeight - 変更後の高さ
 * @param offsetX - X軸オフセット（描画要素の移動量）
 * @param offsetY - Y軸オフセット（描画要素の移動量）
 * @returns CanvasResizedActionオブジェクト
 */
export const createCanvasResizedAction = (
  previousWidth: number,
  previousHeight: number,
  newWidth: number,
  newHeight: number,
  offsetX: number,
  offsetY: number
): CanvasResizedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'canvas:resized',
  previousWidth,
  previousHeight,
  newWidth,
  newHeight,
  offsetX,
  offsetY,
})
