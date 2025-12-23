import type { PointerType, PointerPoint } from '../types'

/**
 * クライアント座標をキャンバスローカル座標に変換
 * @param clientX - クライアントX座標
 * @param clientY - クライアントY座標
 * @param rect - 要素のバウンディングボックス
 * @param pressure - 筆圧（0-1）
 * @param pointerType - ポインターの種類
 * @returns ローカル座標を含むPointerPoint
 */
export const getPointerPoint = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pressure: number,
  pointerType: PointerType
): PointerPoint => ({
  x: clientX - rect.left,
  y: clientY - rect.top,
  pressure,
  pointerType,
})
