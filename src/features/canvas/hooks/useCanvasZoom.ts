import { useState, useCallback } from 'react'
import { DISPLAY_MULTIPLIER } from '@/constants'

/** ズームの最小倍率 */
export const MIN_ZOOM = 0.1
/** ズームの最大倍率 */
export const MAX_ZOOM = 10
/** ズームのステップ（ホイール1回分） */
const ZOOM_STEP = 0.1
/** デフォルトのズーム倍率（内部値、UI表示は2倍にマッピング） */
const DEFAULT_ZOOM = 0.5

/**
 * @deprecated DISPLAY_MULTIPLIER を使用してください
 */
export const ZOOM_DISPLAY_MULTIPLIER = DISPLAY_MULTIPLIER

/**
 * キャンバスのズームを管理するhook
 */
export const useCanvasZoom = () => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  /**
   * ズーム倍率を設定
   * @param value - 新しいズーム倍率
   */
  const setZoomLevel = useCallback((value: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value)))
  }, [])

  /**
   * ズームイン
   */
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP))
  }, [])

  /**
   * ズームアウト
   */
  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP))
  }, [])

  /**
   * ズームをリセット（100%に戻す）
   */
  const resetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
  }, [])

  /**
   * ホイールイベントでズーム
   * @param deltaY - ホイールのスクロール量（正で縮小、負で拡大）
   */
  const handleWheel = useCallback((deltaY: number) => {
    setZoom((prev) => {
      const delta = deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta))
    })
  }, [])

  /**
   * ズーム倍率をパーセント表示用にフォーマット（UI表示は2倍）
   * 内部50% → UI 100%
   */
  const zoomPercent = Math.round(zoom * 100 * DISPLAY_MULTIPLIER)

  return {
    zoom,
    zoomPercent,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
  } as const
}
