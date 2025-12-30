// 型
export type {
  ActionId,
  Timestamp,
  LayerId,
  ActionMetadata,
  DrawableAddedAction,
  DrawablesClearedAction,
  LayerCreatedAction,
  LayerDeletedAction,
  LayerReorderedAction,
  BatchAction,
  DrawableAction,
  LayerAction,
  HistoryAction,
  LayerBlendMode,
  LayerSnapshot,
  LayerRef,
  StorageResult,
  HistoryStorageConfig,
  StackInfo,
  HistoryStorage,
  HistoryStorageFactory,
} from './types'

// ヘルパー（型ガード、Result）
export { isDrawableAction, isLayerAction, isBatchAction, success, failure } from './helpers'

// インフラストラクチャ（ストレージ実装）
export { createInMemoryStorage } from './infrastructure'

// ユースケース（アクションクリエイター）
export {
  createDrawableAddedAction,
  createDrawablesClearedAction,
  createLayerCreatedAction,
  createLayerDeletedAction,
  createLayerReorderedAction,
} from './useCases'
