import { useCallback, useState } from 'react'
import type { Point, Stroke } from '../types'
import type { ToolConfig } from '../../tools/types'
import { getToolBehavior } from '../../tools/registry'

export const useDrawing = (onStrokeComplete: (stroke: Stroke) => void) => {
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)

  const startStroke = useCallback((point: Point, config: ToolConfig) => {
    const behavior = getToolBehavior(config.type)
    setCurrentStroke(behavior.createStroke(point, config))
  }, [])

  const addPoint = useCallback((point: Point) => {
    setCurrentStroke((prev) => {
      if (!prev) return prev
      return { ...prev, points: [...prev.points, point] }
    })
  }, [])

  const endStroke = useCallback(() => {
    setCurrentStroke((prev) => {
      if (prev && prev.points.length > 1) {
        onStrokeComplete(prev)
      }
      return null
    })
  }, [onStrokeComplete])

  return {
    currentStroke,
    startStroke,
    addPoint,
    endStroke,
  } as const
}
