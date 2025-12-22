/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { usePointerInput } from './usePointerInput'

describe('usePointerInput', () => {
  const createPointerEvent = (
    _type: string,
    options: Partial<PointerEventInit> = {}
  ): React.PointerEvent<HTMLElement> => {
    const element = document.createElement('div')
    element.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    element.setPointerCapture = vi.fn()
    element.releasePointerCapture = vi.fn()

    return {
      clientX: 50,
      clientY: 50,
      pointerId: 1,
      pointerType: 'mouse',
      pressure: 0.5,
      currentTarget: element,
      preventDefault: vi.fn(),
      ...options,
    } as unknown as React.PointerEvent<HTMLElement>
  }

  it('should initialize with null pointer position', () => {
    const { result } = renderHook(() =>
      usePointerInput({
        onStart: vi.fn(),
        onMove: vi.fn(),
        onEnd: vi.fn(),
      })
    )

    expect(result.current.pointerPosition).toBeNull()
  })

  it('should call onStart when pointer down', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart,
        onMove: vi.fn(),
        onEnd: vi.fn(),
      })
    )

    act(() => {
      result.current.pointerProps.onPointerDown(createPointerEvent('pointerdown'))
    })

    expect(onStart).toHaveBeenCalledWith({
      x: 50,
      y: 50,
      pressure: 0.5,
      pointerType: 'mouse',
    })
  })

  it('should call onMove only when drawing', () => {
    const onMove = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart: vi.fn(),
        onMove,
        onEnd: vi.fn(),
      })
    )

    // Move without drawing - should not call onMove
    act(() => {
      result.current.pointerProps.onPointerMove(createPointerEvent('pointermove'))
    })
    expect(onMove).not.toHaveBeenCalled()

    // Start drawing
    act(() => {
      result.current.pointerProps.onPointerDown(createPointerEvent('pointerdown'))
    })

    // Move while drawing - should call onMove
    act(() => {
      result.current.pointerProps.onPointerMove(createPointerEvent('pointermove', { clientX: 60, clientY: 60 }))
    })
    expect(onMove).toHaveBeenCalled()
  })

  it('should call onEnd when pointer up', () => {
    const onEnd = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart: vi.fn(),
        onMove: vi.fn(),
        onEnd,
      })
    )

    // Start drawing first
    act(() => {
      result.current.pointerProps.onPointerDown(createPointerEvent('pointerdown'))
    })

    // End drawing
    act(() => {
      result.current.pointerProps.onPointerUp(createPointerEvent('pointerup'))
    })

    expect(onEnd).toHaveBeenCalled()
  })

  it('should call onEnd when pointer leaves while drawing', () => {
    const onEnd = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart: vi.fn(),
        onMove: vi.fn(),
        onEnd,
      })
    )

    // Start drawing
    act(() => {
      result.current.pointerProps.onPointerDown(createPointerEvent('pointerdown'))
    })

    // Leave while drawing
    act(() => {
      result.current.pointerProps.onPointerLeave(createPointerEvent('pointerleave'))
    })

    expect(onEnd).toHaveBeenCalled()
    expect(result.current.pointerPosition).toBeNull()
  })

  it('should update pointer position on pointer enter', () => {
    const { result } = renderHook(() =>
      usePointerInput({
        onStart: vi.fn(),
        onMove: vi.fn(),
        onEnd: vi.fn(),
      })
    )

    act(() => {
      result.current.pointerProps.onPointerEnter(createPointerEvent('pointerenter', { clientX: 30, clientY: 40 }))
    })

    expect(result.current.pointerPosition).toEqual({ x: 30, y: 40 })
  })

  it('should call onWheel when provided', () => {
    const onWheel = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart: vi.fn(),
        onMove: vi.fn(),
        onEnd: vi.fn(),
        onWheel,
      })
    )

    const wheelEvent = {
      deltaY: 100,
      preventDefault: vi.fn(),
    } as unknown as React.WheelEvent<HTMLElement>

    act(() => {
      result.current.pointerProps.onWheel(wheelEvent)
    })

    expect(onWheel).toHaveBeenCalledWith(100)
    expect(wheelEvent.preventDefault).toHaveBeenCalled()
  })

  it('should detect pen pointer type', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart,
        onMove: vi.fn(),
        onEnd: vi.fn(),
      })
    )

    act(() => {
      result.current.pointerProps.onPointerDown(
        createPointerEvent('pointerdown', { pointerType: 'pen', pressure: 0.8 })
      )
    })

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        pointerType: 'pen',
        pressure: 0.8,
      })
    )
  })

  it('should detect touch pointer type', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() =>
      usePointerInput({
        onStart,
        onMove: vi.fn(),
        onEnd: vi.fn(),
      })
    )

    act(() => {
      result.current.pointerProps.onPointerDown(
        createPointerEvent('pointerdown', { pointerType: 'touch' })
      )
    })

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        pointerType: 'touch',
      })
    )
  })
})
