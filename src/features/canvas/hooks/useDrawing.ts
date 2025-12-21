import { useCallback, useState } from 'react'
import type { Point, Stroke } from '../types'

type DrawingState = {
  readonly currentStroke: Stroke | null
  readonly strokeWidth: number
  readonly strokeColor: string
}

const createInitialState = (): DrawingState => ({
  currentStroke: null,
  strokeWidth: 3,
  strokeColor: '#ffffff',
})

const createStroke = (
  point: Point,
  width: number,
  color: string
): Stroke => ({
  points: [point],
  width,
  color,
})

const addPointToStroke = (stroke: Stroke, point: Point): Stroke => ({
  ...stroke,
  points: [...stroke.points, point],
})

export const useDrawing = (onStrokeComplete: (stroke: Stroke) => void) => {
  const [state, setState] = useState<DrawingState>(createInitialState)

  const startStroke = useCallback((point: Point) => {
    setState((prev) => ({
      ...prev,
      currentStroke: createStroke(point, prev.strokeWidth, prev.strokeColor),
    }))
  }, [])

  const addPoint = useCallback((point: Point) => {
    setState((prev) => {
      if (!prev.currentStroke) return prev
      return {
        ...prev,
        currentStroke: addPointToStroke(prev.currentStroke, point),
      }
    })
  }, [])

  const endStroke = useCallback(() => {
    const stroke = state.currentStroke
    if (stroke && stroke.points.length > 1) {
      onStrokeComplete(stroke)
    }
    setState((prev) => ({
      ...prev,
      currentStroke: null,
    }))
  }, [onStrokeComplete, state.currentStroke])

  const setStrokeWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, strokeWidth: width }))
  }, [])

  const setStrokeColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, strokeColor: color }))
  }, [])

  return {
    currentStroke: state.currentStroke,
    strokeWidth: state.strokeWidth,
    strokeColor: state.strokeColor,
    startStroke,
    addPoint,
    endStroke,
    setStrokeWidth,
    setStrokeColor,
  } as const
}
