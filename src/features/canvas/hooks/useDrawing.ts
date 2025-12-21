import { useCallback, useState } from 'react'
import type { Point, Stroke, Tool } from '../types'

type DrawingState = {
  readonly currentStroke: Stroke | null
  readonly strokeWidth: number
  readonly strokeColor: string
  readonly eraserWidth: number
  readonly tool: Tool
}

const ERASER_COLOR = '#ffffff'

const createInitialState = (): DrawingState => ({
  currentStroke: null,
  strokeWidth: 3,
  strokeColor: '#000000',
  eraserWidth: 20,
  tool: 'pen',
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
    setState((prev) => {
      const width = prev.tool === 'eraser' ? prev.eraserWidth : prev.strokeWidth
      const color = prev.tool === 'eraser' ? ERASER_COLOR : prev.strokeColor
      return {
        ...prev,
        currentStroke: createStroke(point, width, color),
      }
    })
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

  const setEraserWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, eraserWidth: width }))
  }, [])

  const setTool = useCallback((tool: Tool) => {
    setState((prev) => ({ ...prev, tool }))
  }, [])

  return {
    currentStroke: state.currentStroke,
    strokeWidth: state.strokeWidth,
    strokeColor: state.strokeColor,
    eraserWidth: state.eraserWidth,
    tool: state.tool,
    startStroke,
    addPoint,
    endStroke,
    setStrokeWidth,
    setStrokeColor,
    setEraserWidth,
    setTool,
  } as const
}
