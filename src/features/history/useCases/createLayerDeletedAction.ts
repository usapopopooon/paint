import { generateId } from '@/lib/id'
import type { LayerDeletedAction, LayerId } from '../types/actions'
import type { LayerSnapshot } from '../types/layer'

/**
 * レイヤー削除アクションを作成
 * @param layerId - 削除されたレイヤーのID
 * @param layerSnapshot - 削除前のレイヤー状態スナップショット
 * @returns LayerDeletedActionオブジェクト
 */
export const createLayerDeletedAction = (
  layerId: LayerId,
  layerSnapshot: LayerSnapshot
): LayerDeletedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:deleted',
  layerId,
  layerSnapshot,
})
