// Types
export type {
  SelectionToolType,
  SelectionPhase,
  SelectionShape,
  SelectionRegion,
  SelectionToolConfig,
  RectangleSelectionToolConfig,
  LassoSelectionToolConfig,
  SelectionClipboard,
  SelectionState,
} from './types'

// Constants
export {
  MARCHING_ANTS_DASH,
  MARCHING_ANTS_SPEED,
  MIN_SELECTION_SIZE,
  MIN_LASSO_POINTS,
  DEFAULT_FEATHER,
  DEFAULT_ANTI_ALIAS,
} from './constants'

// Domain
export { rectangleSelectionBehavior, lassoSelectionBehavior } from './domain'

// Helpers
export { calculateBoundsFromPoints, isPointInSelection } from './helpers'

// Hooks
export { useSelection } from './hooks'
export type { UseSelectionReturn } from './hooks'

// Adapters
export {
  renderSelection2D,
  renderSelectionPreview2D,
  renderRectanglePreview2D,
  renderLassoPreview2D,
  getImageDataFromSelection,
  getSelectionBounds,
  clearSelectionRegion,
  putImageDataAt,
  fillSelectionRegion,
  getMaskedImageDataFromSelection,
  imageDataToDataURL,
  renderLayerToOffscreenCanvas,
  canvasToDataURL,
  createEmptyCanvas,
  getOrCreateOffscreenCanvas,
  imageDataToCanvas,
  drawImageDataToContext,
} from './adapters'

// Components
export { SelectionOverlay, SelectionToolButton } from './components'
