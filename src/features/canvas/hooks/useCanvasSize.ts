import { useState, useCallback } from 'react'

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
 * キャンバスサイズを管理するhook
 * @returns キャンバスサイズの状態と更新関数
 */
export const useCanvasSize = () => {
  const [size, setSize] = useState<CanvasSize>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  })

  /**
   * 幅を設定
   * @param width - 新しい幅
   */
  const setWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, width))
    setSize((prev) => ({ ...prev, width: clampedWidth }))
  }, [])

  /**
   * 高さを設定
   * @param height - 新しい高さ
   */
  const setHeight = useCallback((height: number) => {
    const clampedHeight = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, height))
    setSize((prev) => ({ ...prev, height: clampedHeight }))
  }, [])

  return {
    width: size.width,
    height: size.height,
    setWidth,
    setHeight,
  } as const
}
