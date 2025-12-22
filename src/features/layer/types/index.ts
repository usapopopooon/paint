import type { Drawable } from '@/features/drawable'

/**
 * Layer identifier
 */
export type LayerId = string

/**
 * Layer type
 * - background: Background layer (always at the back)
 * - drawing: Normal drawing layer
 */
export type LayerType = 'background' | 'drawing'

/**
 * Layer blend mode
 * Compatible with both Canvas 2D and PixiJS
 */
export type LayerBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'

/**
 * Layer state
 */
export type Layer = {
  readonly id: LayerId
  readonly name: string
  readonly type: LayerType
  readonly visible: boolean
  readonly locked: boolean
  readonly opacity: number // 0-1
  readonly blendMode: LayerBlendMode
  readonly drawables: readonly Drawable[]
}

/**
 * Complete layer structure state
 */
export type LayerState = {
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
}

/**
 * Create a background layer
 */
export const createBackgroundLayer = (): Layer => ({
  id: 'background',
  name: 'Background',
  type: 'background',
  visible: true,
  locked: true,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})

/**
 * Create a drawing layer
 */
export const createDrawingLayer = (id?: string, name?: string): Layer => ({
  id: id ?? `layer-${Date.now()}`,
  name: name ?? 'Layer 1',
  type: 'drawing',
  visible: true,
  locked: false,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})

/**
 * Create initial layer state with background + one drawing layer
 */
export const createInitialLayerState = (): LayerState => ({
  layers: [createBackgroundLayer(), createDrawingLayer('drawing', 'Layer 1')],
  activeLayerId: 'drawing',
})
