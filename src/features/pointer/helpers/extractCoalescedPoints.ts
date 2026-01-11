import type { PointerPoint } from '../types'
import { getPointerType, getPointerPoint } from './index'

/** 最小ポイント間距離（ピクセル） - これより近いポイントはスキップ */
const MIN_POINT_DISTANCE = 1.5

/**
 * 2点間の距離を計算
 */
const distance = (p1: PointerPoint, p2: PointerPoint): number => {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * PointerEventからcoalescedイベントを含む全ポイントを抽出
 * getCoalescedEvents()は高速な動きで1フレーム内に複数のポイントをバッチ処理する
 * これにより、より滑らかなストローク描画が可能になる
 *
 * 近すぎるポイントはノイズとして除去される
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
    // 最適化: mapとフィルタを1パスで実行し、一時配列の生成を削減
    const filteredPoints: PointerPoint[] = []
    let lastPoint: PointerPoint | null = null

    for (const e of coalescedEvents) {
      const pointerType = getPointerType(e.pointerType)
      const currentPoint = getPointerPoint(e.clientX, e.clientY, rect, e.pressure, pointerType, zoom)

      // 最初のポイントか、十分な距離がある場合のみ追加
      if (!lastPoint || distance(lastPoint, currentPoint) >= MIN_POINT_DISTANCE) {
        filteredPoints.push(currentPoint)
        lastPoint = currentPoint
      }
    }

    // 最後のポイントは常に含める（ストロークの終端位置を正確に）
    if (coalescedEvents.length > 0) {
      const lastEvent = coalescedEvents[coalescedEvents.length - 1]
      const pointerType = getPointerType(lastEvent.pointerType)
      const lastAllPoint = getPointerPoint(
        lastEvent.clientX,
        lastEvent.clientY,
        rect,
        lastEvent.pressure,
        pointerType,
        zoom
      )
      const lastFilteredPoint = filteredPoints[filteredPoints.length - 1]
      if (lastFilteredPoint !== lastAllPoint && distance(lastFilteredPoint, lastAllPoint) > 0) {
        filteredPoints.push(lastAllPoint)
      }
    }

    return filteredPoints
  }

  // フォールバック: 通常のイベントを使用
  const pointerType = getPointerType(event.pointerType)
  return [getPointerPoint(event.clientX, event.clientY, rect, event.pressure, pointerType, zoom)]
}
