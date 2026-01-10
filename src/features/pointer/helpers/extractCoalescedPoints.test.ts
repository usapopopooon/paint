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
})
