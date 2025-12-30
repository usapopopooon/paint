import { generateId } from '@/lib/id'
import type { LayerOpacityChangedAction, LayerId } from '../types/actions'

/**
 * レイヤー不透明度変更アクションを作成
 * @param layerId - 対象レイヤーのID
 * @param previousValue - 変更前の不透明度
 * @param newValue - 変更後の不透明度
 * @returns LayerOpacityChangedActionオブジェクト
 */
export const createLayerOpacityChangedAction = (
  layerId: LayerId,
  previousValue: number,
  newValue: number
): LayerOpacityChangedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:opacity-changed',
  layerId,
  previousValue,
  newValue,
})
