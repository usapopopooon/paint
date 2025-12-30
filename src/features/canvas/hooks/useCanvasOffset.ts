import { useState, useCallback } from 'react'

export type CanvasOffset = {
  readonly x: number
  readonly y: number
}

/**
 * キャンバスのオフセット（スクロール位置）を管理するhook
 */
export const useCanvasOffset = () => {
  const [offset, setOffset] = useState<CanvasOffset>({ x: 0, y: 0 })

  /**
   * オフセットを相対的に移動
   * @param deltaX - X方向の移動量
   * @param deltaY - Y方向の移動量
   */
  const pan = useCallback((deltaX: number, deltaY: number) => {
    setOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))
  }, [])

  /**
   * オフセットをリセット
   */
  const reset = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  return {
    offset,
    pan,
    reset,
  } as const
}
