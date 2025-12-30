import { useCallback, useRef, useState } from 'react'
import type { Drawable, StrokeDrawable, Point } from '@/features/drawable'
import { hasMinimumPoints } from '@/features/drawable'
import type { ToolConfig } from '../../tools/types'
import { getToolBehavior } from '../../tools/domain'

/**
 * 描画中のストローク状態を管理するフック
 * @param onDrawableComplete - Drawable完成時に呼ばれるコールバック
 * @returns ストローク操作用のメソッドと現在のストローク状態
 */
export const useDrawing = (onDrawableComplete: (drawable: Drawable) => void) => {
  const [currentStroke, setCurrentStroke] = useState<StrokeDrawable | null>(null)
  const currentStrokeRef = useRef<StrokeDrawable | null>(null)

  /**
   * ストロークを開始
   * @param point - 開始位置
   * @param config - ツール設定
   */
  const startStroke = useCallback((point: Point, config: ToolConfig) => {
    const behavior = getToolBehavior(config.type)
    const stroke = behavior.createStroke(point, config)
    currentStrokeRef.current = stroke
    setCurrentStroke(stroke)
  }, [])

  /**
   * ストロークにポイントを追加
   * @param point - 追加するポイント
   */
  const addPoint = useCallback((point: Point) => {
    setCurrentStroke((prev) => {
      if (!prev) return prev
      const updated = { ...prev, points: [...prev.points, point] }
      currentStrokeRef.current = updated
      return updated
    })
  }, [])

  /** ストロークを終了し、完成したDrawableをコールバックに渡す */
  const endStroke = useCallback(() => {
    const stroke = currentStrokeRef.current
    if (stroke && hasMinimumPoints(stroke.points.length)) {
      onDrawableComplete(stroke)
    }
    currentStrokeRef.current = null
    setCurrentStroke(null)
  }, [onDrawableComplete])

  return {
    currentStroke,
    startStroke,
    addPoint,
    endStroke,
  } as const
}
