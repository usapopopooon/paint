import type { PointerPoint } from '../types'
import { getPointerType, getPointerPoint } from './index'

/**
 * PointerEventからcoalescedイベントを含む全ポイントを抽出
 * getCoalescedEvents()は高速な動きで1フレーム内に複数のポイントをバッチ処理する
 * これにより、より滑らかなストローク描画が可能になる
 *
 * @param event - React PointerEvent
 * @param element - 対象のHTML要素
 * @param zoom - ズーム倍率（デフォルト: 1）
 * @returns PointerPointの配列（最低1つ）
 */
export const extractCoalescedPoints = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement,
  zoom: number = 1
): PointerPoint[] => {
  const rect = element.getBoundingClientRect()
  const nativeEvent = event.nativeEvent

  // getCoalescedEventsがサポートされていて、複数のイベントがある場合
  const coalescedEvents = nativeEvent.getCoalescedEvents?.() ?? []

  if (coalescedEvents.length > 0) {
    return coalescedEvents.map((e) => {
      const pointerType = getPointerType(e.pointerType)
      return getPointerPoint(e.clientX, e.clientY, rect, e.pressure, pointerType, zoom)
    })
  }

  // フォールバック: 通常のイベントを使用
  const pointerType = getPointerType(event.pointerType)
  return [getPointerPoint(event.clientX, event.clientY, rect, event.pressure, pointerType, zoom)]
}
