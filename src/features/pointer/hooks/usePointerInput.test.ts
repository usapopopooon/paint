import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePointerInput } from './usePointerInput'
import { colorWheelState } from '@/features/color/hooks/colorWheelState'

describe('usePointerInput', () => {
  const mockOnStart = vi.fn()
  const mockOnMove = vi.fn()
  const mockOnEnd = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    colorWheelState.isDragging = false
  })

  afterEach(() => {
    colorWheelState.isDragging = false
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
    test('ボタンが押されていない場合はストロークを開始しない', () => {
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

    test('左ボタンが押されている場合はストロークを開始する', () => {
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

    test('右ボタンのみが押されている場合はストロークを開始しない', () => {
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

    test('既に描画中の場合は新しいストロークを開始しない', () => {
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

    test('キャンバス外でのポインター位置を追跡してストローク開始位置として使用する', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // まずpointerEnterでcanvasElementRefを設定
      const initialEnterEvent = createPointerEvent('pointerenter', { buttons: 0 })
      act(() => {
        result.current.pointerProps.onPointerEnter(initialEnterEvent)
      })

      // ウィンドウレベルでポインター移動をシミュレート（キャンバス外でボタンを押しながら移動）
      const windowPointerMoveEvent = new PointerEvent('pointermove', {
        clientX: -50, // キャンバス外（左側）
        clientY: 25,
        buttons: 1,
        pressure: 0.7,
        pointerType: 'mouse',
      })
      act(() => {
        window.dispatchEvent(windowPointerMoveEvent)
      })

      // キャンバスにenterする
      const enterEvent = createPointerEvent('pointerenter', {
        buttons: 1,
        clientX: 10, // キャンバス内
        clientY: 30,
      })
      act(() => {
        result.current.pointerProps.onPointerEnter(enterEvent)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1)
      // pending位置（キャンバス外の位置）が使われる
      const startPoint = mockOnStart.mock.calls[0][0]
      expect(startPoint.x).toBe(-50) // キャンバス外の位置
      expect(startPoint.y).toBe(25)
    })

    test('ColorWheelがドラッグ中の場合はストロークを開始しない', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // ColorWheelがドラッグ中
      colorWheelState.isDragging = true

      const event = createPointerEvent('pointerenter', { buttons: 1 })

      act(() => {
        result.current.pointerProps.onPointerEnter(event)
      })

      expect(mockOnStart).not.toHaveBeenCalled()
      expect(result.current.isDrawing).toBe(false)
    })

    test('ColorWheelがドラッグ中の場合はpending位置を記録しない', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // まずpointerEnterでcanvasElementRefを設定
      const initialEnterEvent = createPointerEvent('pointerenter', { buttons: 0 })
      act(() => {
        result.current.pointerProps.onPointerEnter(initialEnterEvent)
      })

      // ColorWheelがドラッグ中にウィンドウレベルでポインター移動
      colorWheelState.isDragging = true
      const windowPointerMoveEvent = new PointerEvent('pointermove', {
        clientX: -50,
        clientY: 25,
        buttons: 1,
        pressure: 0.7,
        pointerType: 'mouse',
      })
      act(() => {
        window.dispatchEvent(windowPointerMoveEvent)
      })

      // ColorWheelドラッグ終了後にキャンバスにenter
      colorWheelState.isDragging = false
      const enterEvent = createPointerEvent('pointerenter', {
        buttons: 1,
        clientX: 10,
        clientY: 30,
      })
      act(() => {
        result.current.pointerProps.onPointerEnter(enterEvent)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1)
      // pending位置は記録されていないので、enter位置が使われる
      const startPoint = mockOnStart.mock.calls[0][0]
      expect(startPoint.x).toBe(10)
      expect(startPoint.y).toBe(30)
    })
  })

  describe('onWheel', () => {
    test('pointerPropsにonWheelが含まれていない（ネイティブイベントリスナーを使用）', () => {
      const mockOnWheel = vi.fn()
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
          onWheel: mockOnWheel,
        })
      )

      // pointerPropsにonWheelプロパティが含まれていないことを確認
      // （Reactのpassiveイベントリスナーではなくネイティブリスナーを使用するため）
      expect(result.current.pointerProps).not.toHaveProperty('onWheel')
    })

    test('onWheelコールバックを受け取ることができる', () => {
      const mockOnWheel = vi.fn()
      // onWheelを渡してもエラーにならないことを確認
      expect(() =>
        renderHook(() =>
          usePointerInput({
            onStart: mockOnStart,
            onMove: mockOnMove,
            onEnd: mockOnEnd,
            onWheel: mockOnWheel,
          })
        )
      ).not.toThrow()
    })

    test('onWheelコールバックなしでも正常に動作する', () => {
      expect(() =>
        renderHook(() =>
          usePointerInput({
            onStart: mockOnStart,
            onMove: mockOnMove,
            onEnd: mockOnEnd,
            // onWheel is not provided
          })
        )
      ).not.toThrow()
    })
  })

  describe('canvasRef', () => {
    test('canvasRefでキャンバス要素を設定するとキャンバス外からのストローク開始位置が追跡される', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // canvasRefでキャンバス要素を設定（マウント時の動作をシミュレート）
      const mockElement = document.createElement('div')
      mockElement.getBoundingClientRect = () => ({
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
      mockElement.setPointerCapture = vi.fn()

      act(() => {
        result.current.canvasRef(mockElement)
      })

      // ウィンドウレベルでポインター移動をシミュレート（キャンバス外でボタンを押しながら移動）
      const windowPointerMoveEvent = new PointerEvent('pointermove', {
        clientX: -30,
        clientY: 20,
        buttons: 1,
        pressure: 0.5,
        pointerType: 'mouse',
      })
      act(() => {
        window.dispatchEvent(windowPointerMoveEvent)
      })

      // キャンバスにenterする
      const enterEvent = createPointerEvent('pointerenter', {
        buttons: 1,
        clientX: 5,
        clientY: 15,
      })
      act(() => {
        result.current.pointerProps.onPointerEnter(enterEvent)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1)
      // canvasRefで設定した要素を使ってpending位置が計算される
      const startPoint = mockOnStart.mock.calls[0][0]
      expect(startPoint.x).toBe(-30)
      expect(startPoint.y).toBe(20)
    })

    test('canvasRefが呼ばれていない場合はキャンバス外のポインター位置は追跡されない', () => {
      const { result } = renderHook(() =>
        usePointerInput({
          onStart: mockOnStart,
          onMove: mockOnMove,
          onEnd: mockOnEnd,
        })
      )

      // canvasRefを呼ばない状態でウィンドウレベルのポインター移動
      const windowPointerMoveEvent = new PointerEvent('pointermove', {
        clientX: -30,
        clientY: 20,
        buttons: 1,
        pressure: 0.5,
        pointerType: 'mouse',
      })
      act(() => {
        window.dispatchEvent(windowPointerMoveEvent)
      })

      // キャンバスにenterする
      const enterEvent = createPointerEvent('pointerenter', {
        buttons: 1,
        clientX: 5,
        clientY: 15,
      })
      act(() => {
        result.current.pointerProps.onPointerEnter(enterEvent)
      })

      expect(mockOnStart).toHaveBeenCalledTimes(1)
      // pending位置は記録されていないので、enter位置が使われる
      const startPoint = mockOnStart.mock.calls[0][0]
      expect(startPoint.x).toBe(5)
      expect(startPoint.y).toBe(15)
    })
  })
})
