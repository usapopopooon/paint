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
