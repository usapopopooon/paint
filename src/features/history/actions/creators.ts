import type { Drawable } from '@/features/drawable'
import type {
  DrawableAddedAction,
  DrawablesClearedAction,
  LayerCreatedAction,
  LayerDeletedAction,
  LayerReorderedAction,
  LayerId,
} from '../types/actions'
import type { LayerSnapshot } from '../types/layer'

/**
 * Generate a unique action ID
 */
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/**
 * Get current timestamp
 */
const now = (): number => Date.now()

// === Drawable Action Creators ===

export const createDrawableAddedAction = (
  drawable: Drawable,
  layerId?: LayerId
): DrawableAddedAction => ({
  id: generateId(),
  timestamp: now(),
  type: 'drawable:added',
  drawable,
  layerId,
})

export const createDrawablesClearedAction = (
  previousDrawables: readonly Drawable[],
  layerId?: LayerId
): DrawablesClearedAction => ({
  id: generateId(),
  timestamp: now(),
  type: 'drawables:cleared',
  previousDrawables,
  layerId,
})

// === Layer Action Creators ===

export const createLayerCreatedAction = (
  layerId: LayerId,
  name: string,
  index: number
): LayerCreatedAction => ({
  id: generateId(),
  timestamp: now(),
  type: 'layer:created',
  layerId,
  name,
  index,
})

export const createLayerDeletedAction = (
  layerId: LayerId,
  layerSnapshot: LayerSnapshot
): LayerDeletedAction => ({
  id: generateId(),
  timestamp: now(),
  type: 'layer:deleted',
  layerId,
  layerSnapshot,
})

export const createLayerReorderedAction = (
  layerId: LayerId,
  fromIndex: number,
  toIndex: number
): LayerReorderedAction => ({
  id: generateId(),
  timestamp: now(),
  type: 'layer:reordered',
  layerId,
  fromIndex,
  toIndex,
})
