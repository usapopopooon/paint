import type { Drawable } from '@/features/drawable'
import type { LayerId } from '@/features/layer'
import type { LayerSnapshot } from './layer'

// 便宜上LayerIdを再エクスポート
export type { LayerId }

/**
 * 履歴アクションのユニーク識別子
 */
export type ActionId = string

/**
 * ミリ秒単位のタイムスタンプ
 */
export type Timestamp = number

/**
 * 基本アクションメタデータ - 全アクションに含まれる
 */
export type ActionMetadata = {
  readonly id: ActionId
  readonly timestamp: Timestamp
  readonly layerId?: LayerId // undefined = グローバルアクション
}

// === 描画要素アクション ===

export type DrawableAddedAction = ActionMetadata & {
  readonly type: 'drawable:added'
  readonly drawable: Drawable
}

export type DrawablesClearedAction = ActionMetadata & {
  readonly type: 'drawables:cleared'
  readonly previousDrawables: readonly Drawable[]
}

// === レイヤーアクション（将来対応用） ===

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

// === バッチアクション（複合操作用） ===

export type BatchAction = ActionMetadata & {
  readonly type: 'batch'
  readonly actions: readonly HistoryAction[]
  readonly description?: string
}

// === ユニオン型 ===

export type DrawableAction = DrawableAddedAction | DrawablesClearedAction

export type LayerAction =
  | LayerCreatedAction
  | LayerDeletedAction
  | LayerReorderedAction
  | LayerVisibilityChangedAction
  | LayerOpacityChangedAction
  | LayerRenamedAction

export type HistoryAction = DrawableAction | LayerAction | BatchAction

// === 型ガード ===

export const isDrawableAction = (action: HistoryAction): action is DrawableAction =>
  action.type.startsWith('drawable')

export const isLayerAction = (action: HistoryAction): action is LayerAction =>
  action.type.startsWith('layer')

export const isBatchAction = (action: HistoryAction): action is BatchAction =>
  action.type === 'batch'
