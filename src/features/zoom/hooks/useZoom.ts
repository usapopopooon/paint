import { useState, useCallback } from 'react'
import { DISPLAY_MULTIPLIER } from '@/constants'
import type { CanvasOffset } from '@/features/canvas'
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, DEFAULT_ZOOM } from '../constants'
import { calculateZoomOffset } from '../helpers'

/**
 * ズームを管理するhook
 */
export const useZoom = () => {
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
   * ホイールイベントでズーム（従来の中央ズーム）
   * @param deltaY - ホイールのスクロール量（正で縮小、負で拡大）
   */
  const handleWheel = useCallback((deltaY: number) => {
    setZoom((prev) => {
      const delta = deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta))
    })
  }, [])

  /**
   * 指定位置を中心にズーム
   * @param mouseX - ビューポート内のマウスX座標
   * @param mouseY - ビューポート内のマウスY座標
   * @param direction - ズーム方向（'in' = 拡大, 'out' = 縮小）
   * @param currentOffset - 現在のオフセット
   * @returns 新しいオフセット
   */
  const zoomAtPoint = useCallback(
    (
      mouseX: number,
      mouseY: number,
      direction: 'in' | 'out',
      currentOffset: CanvasOffset
    ): CanvasOffset => {
      const oldZoom = zoom
      const delta = direction === 'in' ? ZOOM_STEP : -ZOOM_STEP
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom + delta))

      setZoom(newZoom)

      if (oldZoom === newZoom) {
        return currentOffset
      }

      return calculateZoomOffset(mouseX, mouseY, oldZoom, newZoom, currentOffset)
    },
    [zoom]
  )

  /**
   * ホイールイベントで指定位置を中心にズーム
   * @param deltaY - ホイールのスクロール量（正で縮小、負で拡大）
   * @param mouseX - ビューポート内のマウスX座標
   * @param mouseY - ビューポート内のマウスY座標
   * @param currentOffset - 現在のオフセット
   * @returns 新しいオフセットとズーム方向
   */
  const handleWheelAtPoint = useCallback(
    (
      deltaY: number,
      mouseX: number,
      mouseY: number,
      currentOffset: CanvasOffset
    ): { offset: CanvasOffset; direction: 'in' | 'out' } => {
      const direction = deltaY > 0 ? 'out' : 'in'
      const offset = zoomAtPoint(mouseX, mouseY, direction, currentOffset)
      return { offset, direction }
    },
    [zoomAtPoint]
  )

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
    zoomAtPoint,
    handleWheelAtPoint,
  } as const
}
