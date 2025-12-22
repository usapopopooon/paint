import { useCallback, useMemo } from 'react'
import type { Point, Stroke } from '../types'
import type { ToolConfig } from '../../tools/types'
import { useCanvasHistory } from './useCanvasHistory'
import { useDrawing } from './useDrawing'

export const useCanvas = () => {
  const history = useCanvasHistory()

  const handleStrokeComplete = useCallback(
    (stroke: Stroke) => {
      history.addStroke(stroke)
    },
    [history.addStroke]
  )

  const drawing = useDrawing(handleStrokeComplete)

  const allStrokes = useMemo(
    (): readonly Stroke[] =>
      drawing.currentStroke ? [...history.strokes, drawing.currentStroke] : history.strokes,
    [history.strokes, drawing.currentStroke]
  )

  const startStroke = useCallback(
    (point: Point, config: ToolConfig) => {
      drawing.startStroke(point, config)
    },
    [drawing.startStroke]
  )

  return {
    strokes: allStrokes,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    startStroke,
    addPoint: drawing.addPoint,
    endStroke: drawing.endStroke,
    undo: history.undo,
    redo: history.redo,
    clear: history.clear,
  } as const
}
