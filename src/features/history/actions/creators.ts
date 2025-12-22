import type { Drawable } from '@/features/drawable'
import { generateId } from '@/lib/id'
import type {
  DrawableAddedAction,
  DrawablesClearedAction,
  LayerCreatedAction,
  LayerDeletedAction,
  LayerReorderedAction,
  LayerId,
} from '../types/actions'
import type { LayerSnapshot } from '../types/layer'

// === 描画要素アクションクリエイター ===

/**
 * Drawable追加アクションを作成
 * @param drawable - 追加されたDrawable
 * @param layerId - 対象レイヤーID（省略時はグローバル）
 * @returns DrawableAddedActionオブジェクト
 */
export const createDrawableAddedAction = (
  drawable: Drawable,
  layerId?: LayerId
): DrawableAddedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'drawable:added',
  drawable,
  layerId,
})

/**
 * Drawablesクリアアクションを作成
 * @param previousDrawables - クリア前のDrawable配列
 * @param layerId - 対象レイヤーID（省略時はグローバル）
 * @returns DrawablesClearedActionオブジェクト
 */
export const createDrawablesClearedAction = (
  previousDrawables: readonly Drawable[],
  layerId?: LayerId
): DrawablesClearedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'drawables:cleared',
  previousDrawables,
  layerId,
})

// === レイヤーアクションクリエイター ===

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
