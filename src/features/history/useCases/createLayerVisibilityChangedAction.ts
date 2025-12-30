import { generateId } from '@/lib/id'
import type { LayerVisibilityChangedAction, LayerId } from '../types/actions'

/**
 * レイヤー可視性変更アクションを作成
 * @param layerId - 対象レイヤーのID
 * @param previousValue - 変更前の可視性
 * @param newValue - 変更後の可視性
 * @returns LayerVisibilityChangedActionオブジェクト
 */
export const createLayerVisibilityChangedAction = (
  layerId: LayerId,
  previousValue: boolean,
  newValue: boolean
): LayerVisibilityChangedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:visibility-changed',
  layerId,
  previousValue,
  newValue,
})
