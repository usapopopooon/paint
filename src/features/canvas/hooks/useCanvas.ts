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

  const getPointFromEvent = useCallback(
    (
      event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
      canvas: HTMLCanvasElement
    ): Point => {
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    },
    []
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
    getPointFromEvent,
  } as const
}
