import { useCallback, useMemo } from 'react'
import type { ToolConfig } from '../../tools/types'
import type { Layer } from '@/features/layer'
import type { Drawable, Point } from '@/features/drawable'
import { useLayers } from '@/features/layer'
import { useCanvasHistory } from './useCanvasHistory'
import { useDrawing } from './useDrawing'

export const useCanvas = () => {
  const layerManager = useLayers()
  const history = useCanvasHistory()

  const handleDrawableComplete = useCallback(
    (drawable: Drawable) => {
      layerManager.addDrawable(drawable)
      history.addDrawable(drawable)
    },
    [layerManager.addDrawable, history.addDrawable]
  )

  const drawing = useDrawing(handleDrawableComplete)

  // Get drawables from active layer for backward compatibility
  const allDrawables = useMemo(
    (): readonly Drawable[] =>
      drawing.currentStroke
        ? [...layerManager.activeLayer.drawables, drawing.currentStroke]
        : layerManager.activeLayer.drawables,
    [layerManager.activeLayer.drawables, drawing.currentStroke]
  )

  // Build layers with current stroke included for rendering
  const allLayers = useMemo((): readonly Layer[] => {
    if (!drawing.currentStroke) return layerManager.layers

    return layerManager.layers.map((layer) =>
      layer.id === layerManager.activeLayerId
        ? { ...layer, drawables: [...layer.drawables, drawing.currentStroke!] }
        : layer
    )
  }, [layerManager.layers, layerManager.activeLayerId, drawing.currentStroke])

  const startStroke = useCallback(
    (point: Point, config: ToolConfig) => {
      drawing.startStroke(point, config)
    },
    [drawing.startStroke]
  )

  // Undo: remove last drawable from active layer and history
  const undo = useCallback(() => {
    if (history.canUndo) {
      layerManager.removeLastDrawable()
      history.undo()
    }
  }, [history.canUndo, history.undo, layerManager.removeLastDrawable])

  // Redo: add drawable back to active layer and history
  const redo = useCallback(async () => {
    if (history.canRedo) {
      const drawable = await history.getRedoDrawable()
      if (drawable) {
        layerManager.addDrawable(drawable)
        await history.redo()
      }
    }
  }, [history.canRedo, history.getRedoDrawable, history.redo, layerManager.addDrawable])

  // Clear: clear active layer and history
  const clear = useCallback(() => {
    layerManager.clearActiveLayer()
    history.clear()
  }, [layerManager.clearActiveLayer, history.clear])

  return {
    drawables: allDrawables,
    layers: allLayers,
    activeLayerId: layerManager.activeLayerId,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    startStroke,
    addPoint: drawing.addPoint,
    endStroke: drawing.endStroke,
    undo,
    redo,
    clear,
  } as const
}
