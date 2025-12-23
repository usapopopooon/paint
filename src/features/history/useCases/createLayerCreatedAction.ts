import { generateId } from '@/lib/id'
import type { LayerCreatedAction, LayerId } from '../types/actions'

/**
 * レイヤー作成アクションを作成
 * @param layerId - 作成されたレイヤーのID
 * @param name - レイヤー名
 * @param index - レイヤーの挿入位置
 * @returns LayerCreatedActionオブジェクト
 */
export const createLayerCreatedAction = (
  layerId: LayerId,
  name: string,
  index: number
): LayerCreatedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:created',
  layerId,
  name,
  index,
})
