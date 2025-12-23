import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePointerInput } from './usePointerInput'

describe('usePointerInput', () => {
  const mockOnStart = vi.fn()
  const mockOnMove = vi.fn()
  const mockOnEnd = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createPointerEvent = (
    type: string,
    options: Partial<{
      pointerId: number
      button: number
      buttons: number
      clientX: number
      clientY: number
      pressure: number
      pointerType: string
    }> = {}
  ): React.PointerEvent<HTMLElement> => {
    const element = document.createElement('div')
    element.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    })
    element.setPointerCapture = vi.fn()
    element.releasePointerCapture = vi.fn()
    element.hasPointerCapture = vi.fn(() => true)

    return {
      type,
      pointerId: options.pointerId ?? 1,
      button: options.button ?? 0,
      buttons: options.buttons ?? 0,
      clientX: options.clientX ?? 50,
      clientY: options.clientY ?? 50,
      pressure: options.pressure ?? 0.5,
      pointerType: options.pointerType ?? 'mouse',
      currentTarget: element,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.PointerEvent<HTMLElement>
  }

  describe('handlePointerEnter', () => {
    it('ボタンが押されていない場合はストロークを開始しない', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      const event = createPointerEvent('pointerenter', { buttons: 0 })

      act(() => {
        result.current.pointerProps.onPointerEnter(event)
      })

      expect(mockOnStart).not.toHaveBeenCalled()
      expect(result.current.isDrawing).toBe(false)
    })

    it('左ボタンが押されている場合はストロークを開始する', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      const event = createPointerEvent('pointerenter', { buttons: 1 })

      act(() => {
        result.current.pointerProps.onPointerEnter(event)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1)
      expect(result.current.isDrawing).toBe(true)
    })

    it('右ボタンのみが押されている場合はストロークを開始しない', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // buttons: 2 = 右ボタン
      const event = createPointerEvent('pointerenter', { buttons: 2 })

      act(() => {
        result.current.pointerProps.onPointerEnter(event)
      })

      expect(mockOnStart).not.toHaveBeenCalled()
      expect(result.current.isDrawing).toBe(false)
    })

    it('既に描画中の場合は新しいストロークを開始しない', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // 最初のpointerdownでストロークを開始
      const downEvent = createPointerEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        buttons: 1,
      })

      act(() => {
        result.current.pointerProps.onPointerDown(downEvent)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1)

      // 別のポインターでenterしても開始しない
      const enterEvent = createPointerEvent('pointerenter', {
        pointerId: 2,
        buttons: 1,
      })

      act(() => {
        result.current.pointerProps.onPointerEnter(enterEvent)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1) // 増えていない
    })
  })
})
