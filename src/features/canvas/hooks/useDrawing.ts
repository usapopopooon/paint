import { useCallback, useState } from 'react'
import type { Drawable, StrokeDrawable, Point } from '@/features/drawable'
import type { ToolConfig } from '../../tools/types'
import { getToolBehavior } from '../../tools/registry'

export const useDrawing = (onDrawableComplete: (drawable: Drawable) => void) => {
  const [currentStroke, setCurrentStroke] = useState<StrokeDrawable | null>(null)

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
        onDrawableComplete(prev)
      }
      return null
    })
  }, [onDrawableComplete])

  return {
    currentStroke,
    startStroke,
    addPoint,
    endStroke,
  } as const
}
