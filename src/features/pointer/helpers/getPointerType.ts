import type { PointerType } from '../types'

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
