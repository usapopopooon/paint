import { generateId } from '@/lib/id'
import type { LayerBlendModeChangedAction, LayerId } from '../types/actions'
import type { LayerBlendMode } from '../types/layer'

/**
 * レイヤーブレンドモード変更アクションを作成
 * @param layerId - 対象レイヤーのID
 * @param previousValue - 変更前のブレンドモード
 * @param newValue - 変更後のブレンドモード
 * @returns LayerBlendModeChangedActionオブジェクト
 */
export const createLayerBlendModeChangedAction = (
  layerId: LayerId,
  previousValue: LayerBlendMode,
  newValue: LayerBlendMode
): LayerBlendModeChangedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:blendmode-changed',
  layerId,
  previousValue,
  newValue,
})
