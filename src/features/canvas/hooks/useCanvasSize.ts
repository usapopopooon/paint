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
 * サイズ変更時の履歴記録用コールバック
 */
export type OnSizeChangeForHistoryCallback = (
  previousWidth: number,
  previousHeight: number,
  newWidth: number,
  newHeight: number,
  offsetX: number,
  offsetY: number
) => void

/**
 * useCanvasSizeフックのオプション
 */
export type UseCanvasSizeOptions = {
  /** サイズ変更時のコールバック（描画要素の移動用） */
  readonly onSizeChange?: OnSizeChangeCallback
  /** サイズ変更時の履歴記録用コールバック */
  readonly onSizeChangeForHistory?: OnSizeChangeForHistoryCallback
}

/**
 * キャンバスサイズを管理するhook
 * @param options - オプション（コールバック関数群）
 * @returns キャンバスサイズの状態と更新関数
 */
export const useCanvasSize = (options?: UseCanvasSizeOptions | OnSizeChangeCallback) => {
  // 後方互換性のため、関数が直接渡された場合はonSizeChangeとして扱う
  const normalizedOptions: UseCanvasSizeOptions =
    typeof options === 'function' ? { onSizeChange: options } : (options ?? {})
  const { onSizeChange, onSizeChangeForHistory } = normalizedOptions
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
      const currentSize = sizeRef.current
      if (clampedWidth !== currentSize.width) {
        // 中央を起点としたオフセットを計算
        const offsetX = (clampedWidth - currentSize.width) / 2
        onSizeChange?.(offsetX, 0)
        onSizeChangeForHistory?.(
          currentSize.width,
          currentSize.height,
          clampedWidth,
          currentSize.height,
          offsetX,
          0
        )
      }
      setSize((prev) => ({ ...prev, width: clampedWidth }))
    },
    [onSizeChange, onSizeChangeForHistory]
  )

  /**
   * 高さを設定（中央を起点として拡大/縮小）
   * @param height - 新しい高さ
   */
  const setHeight = useCallback(
    (height: number) => {
      const clampedHeight = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, height))
      const currentSize = sizeRef.current
      if (clampedHeight !== currentSize.height) {
        // 中央を起点としたオフセットを計算
        const offsetY = (clampedHeight - currentSize.height) / 2
        onSizeChange?.(0, offsetY)
        onSizeChangeForHistory?.(
          currentSize.width,
          currentSize.height,
          currentSize.width,
          clampedHeight,
          0,
          offsetY
        )
      }
      setSize((prev) => ({ ...prev, height: clampedHeight }))
    },
    [onSizeChange, onSizeChangeForHistory]
  )

  /**
   * サイズを直接設定（履歴復元用、コールバックを呼ばない）
   * @param width - 新しい幅
   * @param height - 新しい高さ
   */
  const setSizeDirectly = useCallback((width: number, height: number) => {
    const clampedWidth = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, width))
    const clampedHeight = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, height))
    setSize({ width: clampedWidth, height: clampedHeight })
  }, [])

  return {
    width: size.width,
    height: size.height,
    setWidth,
    setHeight,
    setSizeDirectly,
  } as const
}
