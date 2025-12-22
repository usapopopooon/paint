import type { PointerType, PointerPoint } from './types'

/**
 * ポインターイベントのタイプ文字列をPointerType型に変換
 * @param pointerType - PointerEventのpointerType文字列
 * @returns 対応するPointerType
 */
export const getPointerType = (pointerType: string): PointerType => {
  switch (pointerType) {
    case 'pen':
      return 'pen'
    case 'touch':
      return 'touch'
    default:
      return 'mouse'
  }
}

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
