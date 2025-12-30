import { useState, useCallback, useRef, useEffect } from 'react'

/** デフォルトのキャンバスサイズ */
export const DEFAULT_CANVAS_WIDTH = 800
export const DEFAULT_CANVAS_HEIGHT = 600

/** キャンバスサイズの最小・最大値 */
export const MIN_CANVAS_SIZE = 100
export const MAX_CANVAS_SIZE = 4096

/**
 * キャンバスサイズの型
 */
export type CanvasSize = {
  readonly width: number
  readonly height: number
}

/**
 * サイズ変更時のコールバック
 * @param offsetX - X方向のオフセット（中央基準）
 * @param offsetY - Y方向のオフセット（中央基準）
 */
export type OnSizeChangeCallback = (offsetX: number, offsetY: number) => void

/**
 * キャンバスサイズを管理するhook
 * @param onSizeChange - サイズ変更時のコールバック（中央基準のオフセットを受け取る）
 * @returns キャンバスサイズの状態と更新関数
 */
export const useCanvasSize = (onSizeChange?: OnSizeChangeCallback) => {
  const [size, setSize] = useState<CanvasSize>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  })

  // 現在のサイズをrefで保持（コールバック内で最新値を参照するため）
  const sizeRef = useRef(size)
  useEffect(() => {
    sizeRef.current = size
  }, [size])

  /**
   * 幅を設定（中央を起点として拡大/縮小）
   * @param width - 新しい幅
   */
  const setWidth = useCallback(
    (width: number) => {
      const clampedWidth = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, width))
      const currentWidth = sizeRef.current.width
      if (clampedWidth !== currentWidth) {
        // 中央を起点としたオフセットを計算
        const offsetX = (clampedWidth - currentWidth) / 2
        onSizeChange?.(offsetX, 0)
      }
      setSize((prev) => ({ ...prev, width: clampedWidth }))
    },
    [onSizeChange]
  )

  /**
   * 高さを設定（中央を起点として拡大/縮小）
   * @param height - 新しい高さ
   */
  const setHeight = useCallback(
    (height: number) => {
      const clampedHeight = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, height))
      const currentHeight = sizeRef.current.height
      if (clampedHeight !== currentHeight) {
        // 中央を起点としたオフセットを計算
        const offsetY = (clampedHeight - currentHeight) / 2
        onSizeChange?.(0, offsetY)
      }
      setSize((prev) => ({ ...prev, height: clampedHeight }))
    },
    [onSizeChange]
  )

  return {
    width: size.width,
    height: size.height,
    setWidth,
    setHeight,
  } as const
}
