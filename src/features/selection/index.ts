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
  TransformMode,
  TransformHandlePosition,
  TransformState,
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
  getMaskedImageDataFromSelectionAsync,
  imageDataToDataURL,
  renderLayerToOffscreenCanvas,
  canvasToDataURL,
  createEmptyCanvas,
  getOrCreateOffscreenCanvas,
  imageDataToCanvas,
  drawImageDataToContext,
} from './adapters'

// Components
export {
  SelectionOverlay,
  SelectionToolButton,
  SelectionContextMenu,
  TransformHandles,
  getTransformCursor,
} from './components'
export type { SelectionContextMenuProps } from './components'

// Transform hooks
export { useTransform } from './hooks/useTransform'
export type { UseTransformReturn, TransformResult } from './hooks/useTransform'
