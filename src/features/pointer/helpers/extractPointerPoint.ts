import type { PointerPoint } from '../types'
import { getPointerType, getPointerPoint } from './index'

/**
 * ポインターイベントからPointerPointを抽出
 * @param event - ポインターイベント
 * @param element - 対象のHTML要素
 * @returns ローカル座標のPointerPoint
 */
export const extractPointerPoint = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement
): PointerPoint => {
  const rect = element.getBoundingClientRect()
  const pointerType = getPointerType(event.pointerType)
  return getPointerPoint(
    event.clientX,
    event.clientY,
    rect,
    event.pressure,
    pointerType
  )
}
