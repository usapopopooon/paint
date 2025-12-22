import type { Drawable } from '@/features/drawable'
import type { LayerId } from '@/features/layer'
import type { LayerSnapshot } from './layer'

// Re-export LayerId for convenience
export type { LayerId }

/**
 * Unique identifier for history actions
 */
export type ActionId = string

/**
 * Timestamp in milliseconds
 */
export type Timestamp = number

/**
 * Base action metadata - all actions include this
 */
export type ActionMetadata = {
  readonly id: ActionId
  readonly timestamp: Timestamp
  readonly layerId?: LayerId // undefined = global action
}

// === Drawable Actions ===

export type DrawableAddedAction = ActionMetadata & {
  readonly type: 'drawable:added'
  readonly drawable: Drawable
}

export type DrawablesClearedAction = ActionMetadata & {
  readonly type: 'drawables:cleared'
  readonly previousDrawables: readonly Drawable[]
}

// === Layer Actions (for future support) ===

export type LayerCreatedAction = ActionMetadata & {
  readonly type: 'layer:created'
  readonly name: string
  readonly index: number
}

export type LayerDeletedAction = ActionMetadata & {
  readonly type: 'layer:deleted'
  readonly layerSnapshot: LayerSnapshot
}

export type LayerReorderedAction = ActionMetadata & {
  readonly type: 'layer:reordered'
  readonly fromIndex: number
  readonly toIndex: number
}

export type LayerVisibilityChangedAction = ActionMetadata & {
  readonly type: 'layer:visibility-changed'
  readonly visible: boolean
}

export type LayerOpacityChangedAction = ActionMetadata & {
  readonly type: 'layer:opacity-changed'
  readonly previousOpacity: number
  readonly newOpacity: number
}

export type LayerRenamedAction = ActionMetadata & {
  readonly type: 'layer:renamed'
  readonly previousName: string
  readonly newName: string
}

// === Batch Action (for composite operations) ===

export type BatchAction = ActionMetadata & {
  readonly type: 'batch'
  readonly actions: readonly HistoryAction[]
  readonly description?: string
}

// === Union types ===

export type DrawableAction = DrawableAddedAction | DrawablesClearedAction

export type LayerAction =
  | LayerCreatedAction
  | LayerDeletedAction
  | LayerReorderedAction
  | LayerVisibilityChangedAction
  | LayerOpacityChangedAction
  | LayerRenamedAction

export type HistoryAction = DrawableAction | LayerAction | BatchAction

// === Type guards ===

export const isDrawableAction = (action: HistoryAction): action is DrawableAction =>
  action.type.startsWith('drawable')

export const isLayerAction = (action: HistoryAction): action is LayerAction =>
  action.type.startsWith('layer')

export const isBatchAction = (action: HistoryAction): action is BatchAction =>
  action.type === 'batch'
