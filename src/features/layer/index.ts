// Types
export type {
  LayerId,
  LayerType,
  LayerBlendMode,
  Layer,
  LayerState,
} from './types'

// Factory functions
export {
  createBackgroundLayer,
  createDrawingLayer,
  createInitialLayerState,
} from './types'

// Renderer
export type { LayerRenderer, LayerRendererFactory } from './renderer'
export { createCanvas2DRenderer, blendModeToCompositeOp } from './renderer'

// Hooks
export { useLayers } from './hooks'
export type { UseLayersReturn } from './hooks'
