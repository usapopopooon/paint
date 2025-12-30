import { generateId } from '@/lib/id'
import type { LayerRenamedAction, LayerId } from '../types/actions'

/**
 * レイヤー名変更アクションを作成
 * @param layerId - 対象レイヤーのID
 * @param previousName - 変更前のレイヤー名
 * @param newName - 変更後のレイヤー名
 * @returns LayerRenamedActionオブジェクト
 */
export const createLayerRenamedAction = (
  layerId: LayerId,
  previousName: string,
  newName: string
): LayerRenamedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:renamed',
  layerId,
  previousName,
  newName,
})
