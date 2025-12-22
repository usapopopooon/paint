import type { Drawable } from '@/features/drawable'
import type { LayerId, LayerBlendMode } from '@/features/layer'

// 便宜上再エクスポート
export type { LayerBlendMode }

/**
 * スナップショット用の完全なレイヤー状態（undo/redoで使用）
 */
export type LayerSnapshot = {
  readonly id: LayerId
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly opacity: number
  readonly blendMode: LayerBlendMode
  readonly drawables: readonly Drawable[]
}

/**
 * 最小限のレイヤー参照（ストロークデータなし）
 */
export type LayerRef = {
  readonly id: LayerId
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly opacity: number
  readonly blendMode: LayerBlendMode
}
