import { describe, test, expect, vi } from 'vitest'
import { extractCoalescedPoints } from './extractCoalescedPoints'

describe('extractCoalescedPoints', () => {
  const createMockElement = (rect: DOMRect): HTMLElement =>
    ({
      getBoundingClientRect: vi.fn().mockReturnValue(rect),
    }) as unknown as HTMLElement

  const createMockEvent = (
    clientX: number,
    clientY: number,
    pressure: number,
    pointerType: string,
    coalescedEvents?: PointerEvent[]
  ): React.PointerEvent<HTMLElement> =>
    ({
      clientX,
      clientY,
      pressure,
      pointerType,
      nativeEvent: {
        getCoalescedEvents: coalescedEvents ? () => coalescedEvents : undefined,
      },
    }) as unknown as React.PointerEvent<HTMLElement>

  const createCoalescedEvent = (
    clientX: number,
    clientY: number,
    pressure: number,
    pointerType: string
  ): PointerEvent =>
    ({
      clientX,
      clientY,
      pressure,
      pointerType,
    }) as PointerEvent

  test('coalescedEventsがない場合は単一のポイントを返す', () => {
    const rect = { left: 100, top: 50 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(150, 100, 0.5, 'pen')

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(1)
    expect(result[0].x).toBe(50) // 150 - 100
    expect(result[0].y).toBe(50) // 100 - 50
    expect(result[0].pressure).toBe(0.5)
    expect(result[0].pointerType).toBe('pen')
  })

  test('coalescedEventsがある場合は全ポイントを返す', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const coalescedEvents = [
      createCoalescedEvent(10, 10, 0.3, 'pen'),
      createCoalescedEvent(20, 20, 0.5, 'pen'),
      createCoalescedEvent(30, 30, 0.7, 'pen'),
    ]
    const event = createMockEvent(30, 30, 0.7, 'pen', coalescedEvents)

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ x: 10, y: 10, pressure: 0.3, pointerType: 'pen' })
    expect(result[1]).toEqual({ x: 20, y: 20, pressure: 0.5, pointerType: 'pen' })
    expect(result[2]).toEqual({ x: 30, y: 30, pressure: 0.7, pointerType: 'pen' })
  })

  test('coalescedEventsが空配列の場合は通常のイベントにフォールバック', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(100, 200, 0.5, 'mouse', [])

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(1)
    expect(result[0].x).toBe(100)
    expect(result[0].y).toBe(200)
  })

  test('zoomパラメータが全ポイントに適用される', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const coalescedEvents = [
      createCoalescedEvent(100, 100, 0.5, 'pen'),
      createCoalescedEvent(200, 200, 0.5, 'pen'),
    ]
    const event = createMockEvent(200, 200, 0.5, 'pen', coalescedEvents)

    const result = extractCoalescedPoints(event, element, 2)

    expect(result).toHaveLength(2)
    expect(result[0].x).toBe(50) // 100 / 2
    expect(result[0].y).toBe(50) // 100 / 2
    expect(result[1].x).toBe(100) // 200 / 2
    expect(result[1].y).toBe(100) // 200 / 2
  })

  test('要素オフセットが全ポイントに適用される', () => {
    const rect = { left: 50, top: 50 } as DOMRect
    const element = createMockElement(rect)
    const coalescedEvents = [
      createCoalescedEvent(100, 100, 0.5, 'pen'),
      createCoalescedEvent(150, 150, 0.5, 'pen'),
    ]
    const event = createMockEvent(150, 150, 0.5, 'pen', coalescedEvents)

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(2)
    expect(result[0].x).toBe(50) // 100 - 50
    expect(result[0].y).toBe(50) // 100 - 50
    expect(result[1].x).toBe(100) // 150 - 50
    expect(result[1].y).toBe(100) // 150 - 50
  })

  test('getCoalescedEventsがundefinedの場合は通常のイベントを使用', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = {
      clientX: 100,
      clientY: 200,
      pressure: 0.5,
      pointerType: 'mouse',
      nativeEvent: {
        getCoalescedEvents: undefined,
      },
    } as unknown as React.PointerEvent<HTMLElement>

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(1)
    expect(result[0].x).toBe(100)
    expect(result[0].y).toBe(200)
  })

  test('タッチイベントを正しく処理する', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const coalescedEvents = [
      createCoalescedEvent(50, 50, 1, 'touch'),
      createCoalescedEvent(60, 60, 1, 'touch'),
    ]
    const event = createMockEvent(60, 60, 1, 'touch', coalescedEvents)

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(2)
    expect(result[0].pointerType).toBe('touch')
    expect(result[1].pointerType).toBe('touch')
  })

  test('マウスイベントを正しく処理する', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(100, 100, 0, 'mouse')

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(1)
    expect(result[0].pointerType).toBe('mouse')
    expect(result[0].pressure).toBe(0)
  })

  test('近すぎるポイントはフィルタリングされる（MIN_POINT_DISTANCE = 1.5px）', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    // 0.5pxずつ移動するポイント群（1.5px未満なのでフィルタリングされるべき）
    const coalescedEvents = [
      createCoalescedEvent(10, 10, 0.5, 'pen'),
      createCoalescedEvent(10.5, 10, 0.5, 'pen'), // 0.5px - フィルタ
      createCoalescedEvent(11, 10, 0.5, 'pen'), // 1px累積 - フィルタ
      createCoalescedEvent(11.5, 10, 0.5, 'pen'), // 1.5px累積 - 含む
      createCoalescedEvent(12, 10, 0.5, 'pen'), // 0.5px - フィルタ
    ]
    const event = createMockEvent(12, 10, 0.5, 'pen', coalescedEvents)

    const result = extractCoalescedPoints(event, element)

    // 最初のポイント + 距離1.5px以上のポイント + 最後のポイント
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0].x).toBe(10)
    // 最後のポイントは常に含まれる
    expect(result[result.length - 1].x).toBe(12)
  })

  test('十分な距離があるポイントは全て含まれる', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    // 10pxずつ移動（1.5px以上なので全て含まれる）
    const coalescedEvents = [
      createCoalescedEvent(10, 10, 0.5, 'pen'),
      createCoalescedEvent(20, 10, 0.5, 'pen'),
      createCoalescedEvent(30, 10, 0.5, 'pen'),
      createCoalescedEvent(40, 10, 0.5, 'pen'),
    ]
    const event = createMockEvent(40, 10, 0.5, 'pen', coalescedEvents)

    const result = extractCoalescedPoints(event, element)

    expect(result).toHaveLength(4)
    expect(result[0].x).toBe(10)
    expect(result[1].x).toBe(20)
    expect(result[2].x).toBe(30)
    expect(result[3].x).toBe(40)
  })

  test('最後のポイントは常に含まれる（ストローク終端の精度）', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    // 最後のポイントが近すぎても含まれることを確認
    const coalescedEvents = [
      createCoalescedEvent(10, 10, 0.5, 'pen'),
      createCoalescedEvent(20, 10, 0.5, 'pen'),
      createCoalescedEvent(20.5, 10, 0.5, 'pen'), // 0.5pxしか離れていない
    ]
    const event = createMockEvent(20.5, 10, 0.5, 'pen', coalescedEvents)

    const result = extractCoalescedPoints(event, element)

    // 最後のポイントは近すぎても含まれる
    expect(result[result.length - 1].x).toBe(20.5)
  })
})
