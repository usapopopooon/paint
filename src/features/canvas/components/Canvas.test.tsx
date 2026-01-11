import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Canvas コンポーネントの変形操作テスト
 *
 * 注: Canvasコンポーネントはピクシjsやレンダラーなど複雑な依存関係があるため、
 * コンポーネント全体のレンダリングテストはE2Eで行う。
 *
 * ここではイベントハンドラのロジックをユニットテストする。
 */

describe('Canvas 変形操作ハンドラロジック', () => {
  /**
   * 変形モードでのポインターダウンイベントハンドラのロジックを模倣
   * Canvas.tsx の handlePointerDown の実装と同等
   */
  const createTransformPointerDownHandler = (
    detectHandleAtPoint: (point: { x: number; y: number }, handleSize: number) => string | null,
    onCancelTransform: (() => void) | undefined,
    onConfirmTransform: (() => void) | undefined,
    onStartHandleOperation: ((handle: string, point: { x: number; y: number }) => void) | undefined
  ) => {
    return (button: number, point: { x: number; y: number }) => {
      // 右クリックで変形キャンセル
      if (button === 2) {
        onCancelTransform?.()
        return { preventDefault: true, action: 'cancel' }
      }

      if (button !== 0) return { preventDefault: false, action: 'none' }

      const handle = detectHandleAtPoint(point, 10)

      if (handle) {
        onStartHandleOperation?.(handle, point)
        return { preventDefault: true, action: 'start-handle' }
      } else {
        // ハンドル外を左クリックで変形確定
        onConfirmTransform?.()
        return { preventDefault: true, action: 'confirm' }
      }
    }
  }

  type Point = { x: number; y: number }
  type DetectHandleAtPointFn = (point: Point, handleSize: number) => string | null
  type StartHandleOperationFn = (handle: string, point: Point) => void

  let mockOnCancelTransform: ReturnType<typeof vi.fn<() => void>>
  let mockOnConfirmTransform: ReturnType<typeof vi.fn<() => void>>
  let mockOnStartHandleOperation: ReturnType<typeof vi.fn<StartHandleOperationFn>>
  let mockDetectHandleAtPoint: ReturnType<typeof vi.fn<DetectHandleAtPointFn>>

  beforeEach(() => {
    mockOnCancelTransform = vi.fn<() => void>()
    mockOnConfirmTransform = vi.fn<() => void>()
    mockOnStartHandleOperation = vi.fn<StartHandleOperationFn>()
    mockDetectHandleAtPoint = vi.fn<DetectHandleAtPointFn>()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('右クリック（button === 2）', () => {
    test('右クリックでonCancelTransformが呼ばれる', () => {
      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      const result = handler(2, { x: 50, y: 50 })

      expect(mockOnCancelTransform).toHaveBeenCalledTimes(1)
      expect(mockOnConfirmTransform).not.toHaveBeenCalled()
      expect(mockOnStartHandleOperation).not.toHaveBeenCalled()
      expect(result.action).toBe('cancel')
      expect(result.preventDefault).toBe(true)
    })

    test('右クリック時はdetectHandleAtPointが呼ばれない', () => {
      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      handler(2, { x: 100, y: 100 })

      expect(mockDetectHandleAtPoint).not.toHaveBeenCalled()
    })

    test('onCancelTransformがundefinedでもエラーにならない', () => {
      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        undefined,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      expect(() => handler(2, { x: 50, y: 50 })).not.toThrow()
    })
  })

  describe('左クリック（button === 0）でハンドル外', () => {
    test('ハンドル外左クリックでonConfirmTransformが呼ばれる', () => {
      mockDetectHandleAtPoint.mockReturnValue(null)

      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      const result = handler(0, { x: 50, y: 50 })

      expect(mockOnConfirmTransform).toHaveBeenCalledTimes(1)
      expect(mockOnCancelTransform).not.toHaveBeenCalled()
      expect(mockOnStartHandleOperation).not.toHaveBeenCalled()
      expect(result.action).toBe('confirm')
      expect(result.preventDefault).toBe(true)
    })

    test('onConfirmTransformがundefinedでもエラーにならない', () => {
      mockDetectHandleAtPoint.mockReturnValue(null)

      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        undefined,
        mockOnStartHandleOperation
      )

      expect(() => handler(0, { x: 50, y: 50 })).not.toThrow()
    })
  })

  describe('左クリック（button === 0）でハンドル上', () => {
    test('ハンドル上左クリックでonStartHandleOperationが呼ばれる', () => {
      mockDetectHandleAtPoint.mockReturnValue('top-left')

      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      const point = { x: 100, y: 100 }
      const result = handler(0, point)

      expect(mockOnStartHandleOperation).toHaveBeenCalledTimes(1)
      expect(mockOnStartHandleOperation).toHaveBeenCalledWith('top-left', point)
      expect(mockOnConfirmTransform).not.toHaveBeenCalled()
      expect(mockOnCancelTransform).not.toHaveBeenCalled()
      expect(result.action).toBe('start-handle')
      expect(result.preventDefault).toBe(true)
    })

    test('各種ハンドルタイプで正しく動作する', () => {
      const handleTypes = [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'top',
        'bottom',
        'left',
        'right',
        'move',
      ]

      for (const handleType of handleTypes) {
        mockDetectHandleAtPoint.mockReturnValue(handleType)
        mockOnStartHandleOperation.mockClear()

        const handler = createTransformPointerDownHandler(
          mockDetectHandleAtPoint,
          mockOnCancelTransform,
          mockOnConfirmTransform,
          mockOnStartHandleOperation
        )

        const point = { x: 150, y: 150 }
        handler(0, point)

        expect(mockOnStartHandleOperation).toHaveBeenCalledWith(handleType, point)
      }
    })
  })

  describe('その他のボタン', () => {
    test('中クリック（button === 1）は何もしない', () => {
      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      const result = handler(1, { x: 50, y: 50 })

      expect(mockOnCancelTransform).not.toHaveBeenCalled()
      expect(mockOnConfirmTransform).not.toHaveBeenCalled()
      expect(mockOnStartHandleOperation).not.toHaveBeenCalled()
      expect(result.action).toBe('none')
      expect(result.preventDefault).toBe(false)
    })

    test('button === 3は何もしない', () => {
      const handler = createTransformPointerDownHandler(
        mockDetectHandleAtPoint,
        mockOnCancelTransform,
        mockOnConfirmTransform,
        mockOnStartHandleOperation
      )

      const result = handler(3, { x: 50, y: 50 })

      expect(mockOnCancelTransform).not.toHaveBeenCalled()
      expect(mockOnConfirmTransform).not.toHaveBeenCalled()
      expect(mockOnStartHandleOperation).not.toHaveBeenCalled()
      expect(result.action).toBe('none')
    })
  })
})
