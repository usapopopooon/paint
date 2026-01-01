import { describe, test, expect, vi } from 'vitest'
import { extractPointerPoint } from './extractPointerPoint'

describe('extractPointerPoint', () => {
  const createMockElement = (rect: DOMRect): HTMLElement =>
    ({
      getBoundingClientRect: vi.fn().mockReturnValue(rect),
    }) as unknown as HTMLElement

  const createMockEvent = (
    clientX: number,
    clientY: number,
    pressure: number,
    pointerType: string
  ): React.PointerEvent<HTMLElement> =>
    ({
      clientX,
      clientY,
      pressure,
      pointerType,
    }) as React.PointerEvent<HTMLElement>

  test('正しいローカル座標でポインターポイントを抽出する', () => {
    const rect = {
      left: 100,
      top: 50,
      width: 800,
      height: 600,
    } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(150, 100, 0.5, 'pen')

    const result = extractPointerPoint(event, element)

    expect(result.x).toBe(50) // 150 - 100
    expect(result.y).toBe(50) // 100 - 50
    expect(result.pressure).toBe(0.5)
    expect(result.pointerType).toBe('pen')
  })

  test('マウスポインタータイプを処理する', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(100, 200, 0, 'mouse')

    const result = extractPointerPoint(event, element)

    expect(result.x).toBe(100)
    expect(result.y).toBe(200)
    expect(result.pointerType).toBe('mouse')
  })

  test('タッチポインタータイプを処理する', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(50, 75, 1, 'touch')

    const result = extractPointerPoint(event, element)

    expect(result.pointerType).toBe('touch')
  })

  test('ポインターが要素外の場合は負の座標を処理する', () => {
    const rect = { left: 100, top: 100 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(50, 50, 0.5, 'pen')

    const result = extractPointerPoint(event, element)

    expect(result.x).toBe(-50) // 50 - 100
    expect(result.y).toBe(-50) // 50 - 100
  })

  describe('zoomパラメータ', () => {
    test('zoom 0.5で座標をスケールする', () => {
      const rect = { left: 0, top: 0 } as DOMRect
      const element = createMockElement(rect)
      const event = createMockEvent(100, 100, 0.5, 'pen')

      const result = extractPointerPoint(event, element, 0.5)

      expect(result.x).toBe(200) // 100 / 0.5
      expect(result.y).toBe(200) // 100 / 0.5
    })

    test('zoom 2で座標をスケールする', () => {
      const rect = { left: 0, top: 0 } as DOMRect
      const element = createMockElement(rect)
      const event = createMockEvent(100, 100, 0.5, 'pen')

      const result = extractPointerPoint(event, element, 2)

      expect(result.x).toBe(50) // 100 / 2
      expect(result.y).toBe(50) // 100 / 2
    })

    test('未指定時はデフォルトzoom 1を使用する', () => {
      const rect = { left: 0, top: 0 } as DOMRect
      const element = createMockElement(rect)
      const event = createMockEvent(100, 100, 0.5, 'pen')

      const result = extractPointerPoint(event, element)

      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
    })

    test('オフセット計算後にzoomを適用する', () => {
      const rect = { left: 100, top: 50 } as DOMRect
      const element = createMockElement(rect)
      const event = createMockEvent(200, 150, 0.5, 'pen')

      const result = extractPointerPoint(event, element, 0.5)

      // (200 - 100) / 0.5 = 200, (150 - 50) / 0.5 = 200
      expect(result.x).toBe(200)
      expect(result.y).toBe(200)
    })
  })
})
