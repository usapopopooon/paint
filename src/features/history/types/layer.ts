import type { Drawable } from '@/features/drawable'
import type { LayerId, LayerBlendMode } from '@/features/layer'

// Re-export for convenience
export type { LayerBlendMode }

/**
 * Complete layer state for snapshots (used in undo/redo)
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
 * Minimal layer reference (without stroke data)
 */
export type LayerRef = {
  readonly id: LayerId
  readonly name: string
  readonly visible: boolean
  readonly locked: boolean
  readonly opacity: number
  readonly blendMode: LayerBlendMode
}
