import { generateId } from '@/lib/id'
import type { LayerReorderedAction, LayerId } from '../types/actions'

/**
 * レイヤー並び替えアクションを作成
 * @param layerId - 並び替えられたレイヤーのID
 * @param fromIndex - 移動前のインデックス
 * @param toIndex - 移動後のインデックス
 * @returns LayerReorderedActionオブジェクト
 */
export const createLayerReorderedAction = (
  layerId: LayerId,
  fromIndex: number,
  toIndex: number
): LayerReorderedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:reordered',
  layerId,
  fromIndex,
  toIndex,
})
