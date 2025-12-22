import type { Layer } from '../types'

/**
 * Renderer abstract interface
 * Can be implemented for both Canvas 2D and PixiJS
 */
export interface LayerRenderer {
  /**
   * Render layers
   */
  readonly render: (
    layers: readonly Layer[],
    width: number,
    height: number,
    backgroundColor: string
  ) => void

  /**
   * Release resources
   */
  readonly dispose: () => void

  /**
   * Get canvas element (for DOM attachment)
   */
  readonly getCanvas: () => HTMLCanvasElement
}

/**
 * Renderer factory type
 */
export type LayerRendererFactory = () => LayerRenderer
