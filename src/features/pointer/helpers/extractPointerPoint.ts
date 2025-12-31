import type { PointerPoint } from '../types'
import { getPointerType, getPointerPoint } from './index'

/**
 * ポインターイベントからPointerPointを抽出
 * @param event - ポインターイベント
 * @param element - 対象のHTML要素
 * @param zoom - ズーム倍率（デフォルト: 1）
 * @returns ローカル座標のPointerPoint
 */
export const extractPointerPoint = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement,
  zoom: number = 1
): PointerPoint => {
  const rect = element.getBoundingClientRect()
  const pointerType = getPointerType(event.pointerType)
  return getPointerPoint(event.clientX, event.clientY, rect, event.pressure, pointerType, zoom)
}
