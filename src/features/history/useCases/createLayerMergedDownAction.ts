import { generateId } from '@/lib/id'
import type { LayerMergedDownAction, LayerId } from '../types/actions'
import type { LayerSnapshot } from '../types/layer'

/**
 * レイヤー結合（下のレイヤーと結合）アクションを作成
 * @param lowerLayerId - 結合先（下）レイヤーのID
 * @param upperLayerSnapshot - 上のレイヤーの状態スナップショット
 * @param upperLayerIndex - 上のレイヤーの位置
 * @param lowerLayerSnapshot - 下のレイヤーの状態スナップショット
 * @param lowerLayerIndex - 下のレイヤーの位置
 * @returns LayerMergedDownActionオブジェクト
 */
export const createLayerMergedDownAction = (
  lowerLayerId: LayerId,
  upperLayerSnapshot: LayerSnapshot,
  upperLayerIndex: number,
  lowerLayerSnapshot: LayerSnapshot,
  lowerLayerIndex: number
): LayerMergedDownAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'layer:merged-down',
  layerId: lowerLayerId,
  upperLayerSnapshot,
  upperLayerIndex,
  lowerLayerSnapshot,
  lowerLayerIndex,
})
