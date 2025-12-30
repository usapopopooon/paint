import { describe, it, expect, vi } from 'vitest'
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

  it('should extract pointer point with correct local coordinates', () => {
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

  it('should handle mouse pointer type', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(100, 200, 0, 'mouse')

    const result = extractPointerPoint(event, element)

    expect(result.x).toBe(100)
    expect(result.y).toBe(200)
    expect(result.pointerType).toBe('mouse')
  })

  it('should handle touch pointer type', () => {
    const rect = { left: 0, top: 0 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(50, 75, 1, 'touch')

    const result = extractPointerPoint(event, element)

    expect(result.pointerType).toBe('touch')
  })

  it('should handle negative coordinates when pointer is outside element', () => {
    const rect = { left: 100, top: 100 } as DOMRect
    const element = createMockElement(rect)
    const event = createMockEvent(50, 50, 0.5, 'pen')

    const result = extractPointerPoint(event, element)

    expect(result.x).toBe(-50) // 50 - 100
    expect(result.y).toBe(-50) // 50 - 100
  })
})
