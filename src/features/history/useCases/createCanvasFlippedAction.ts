import type { Drawable } from '@/features/drawable'
import type { LayerId } from '@/features/layer'
import { generateId } from '@/lib/id'
import type { CanvasFlippedAction } from '../types/actions'

type LayerSnapshot = {
  readonly layerId: LayerId
  readonly previousDrawables: readonly Drawable[]
}

/**
 * キャンバス反転アクションを作成
 * @param direction - 反転方向
 * @param canvasWidth - キャンバスの幅
 * @param layerSnapshots - 各レイヤーの反転前のドローアブル
 * @returns CanvasFlippedActionオブジェクト
 */
export const createCanvasFlippedAction = (
  direction: 'horizontal',
  canvasWidth: number,
  layerSnapshots: readonly LayerSnapshot[]
): CanvasFlippedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'canvas:flipped',
  direction,
  canvasWidth,
  layerSnapshots,
})
