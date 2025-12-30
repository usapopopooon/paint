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
   * オフセットを絶対位置で設定
   * @param x - X座標
   * @param y - Y座標
   */
  const setPosition = useCallback((x: number, y: number) => {
    setOffset({ x, y })
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
    setPosition,
    reset,
  } as const
}
