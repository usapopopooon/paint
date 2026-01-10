import { useCallback, useEffect, useRef, useState } from 'react'
import type { Drawable, StrokeDrawable, Point } from '@/features/drawable'
import { hasMinimumPoints } from '@/features/drawable'
import type { ToolConfig } from '../../tools/types'
import { getToolBehavior } from '../../tools/domain'

/**
 * 描画中のストローク状態を管理するフック
 * requestAnimationFrameを使用してポイント追加をフレームに同期し、
 * 複数のポイントをバッチ処理することでパフォーマンスを向上
 * @param onDrawableComplete - Drawable完成時に呼ばれるコールバック
 * @returns ストローク操作用のメソッドと現在のストローク状態
 */
export const useDrawing = (onDrawableComplete: (drawable: Drawable) => void) => {
  const [currentStroke, setCurrentStroke] = useState<StrokeDrawable | null>(null)
  const currentStrokeRef = useRef<StrokeDrawable | null>(null)
  // ペンディング中のポイントをバッファリング
  const pendingPointsRef = useRef<Point[]>([])
  // requestAnimationFrameのID
  const rafIdRef = useRef<number | null>(null)

  /**
   * ペンディング中のポイントをフラッシュしてストロークを更新
   */
  const flushPendingPoints = useCallback(() => {
    rafIdRef.current = null
    const pendingPoints = pendingPointsRef.current
    if (pendingPoints.length === 0) return

    pendingPointsRef.current = []

    setCurrentStroke((prev) => {
      if (!prev) return prev
      const updated = { ...prev, points: [...prev.points, ...pendingPoints] }
      currentStrokeRef.current = updated
      return updated
    })
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  /**
   * ストロークを開始
   * @param point - 開始位置
   * @param config - ツール設定
   */
  const startStroke = useCallback((point: Point, config: ToolConfig) => {
    // 開始時にペンディングをクリア
    pendingPointsRef.current = []
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }

    const behavior = getToolBehavior(config.type)
    const stroke = behavior.createStroke(point, config)
    currentStrokeRef.current = stroke
    setCurrentStroke(stroke)
  }, [])

  /**
   * ストロークにポイントを追加
   * requestAnimationFrameを使用してフレームに同期
   * @param point - 追加するポイント
   */
  const addPoint = useCallback(
    (point: Point) => {
      // ポイントをバッファに追加
      pendingPointsRef.current.push(point)

      // まだrAFがスケジュールされていなければスケジュール
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(flushPendingPoints)
      }
    },
    [flushPendingPoints]
  )

  /** ストロークを終了し、完成したDrawableをコールバックに渡す */
  const endStroke = useCallback(() => {
    // ペンディング中のrAFをキャンセル
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }

    // ペンディング中のポイントを含めた最終的なストロークを作成
    const pendingPoints = pendingPointsRef.current
    pendingPointsRef.current = []

    let stroke = currentStrokeRef.current
    if (stroke && pendingPoints.length > 0) {
      stroke = { ...stroke, points: [...stroke.points, ...pendingPoints] }
    }

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
