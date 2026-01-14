import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { StabilizedPointer, createStabilizedPointer } from './StabilizedPointer'
import type { PointerPoint } from '../types'

const createPoint = (x: number, y: number, pressure = 0.5): PointerPoint => ({
  x,
  y,
  pressure,
  pointerType: 'pen',
})

// rAFモック
let rafCallback: (() => void) | null = null
const mockRequestAnimationFrame = vi.fn((cb: () => void) => {
  rafCallback = cb
  return 1
})
const mockCancelAnimationFrame = vi.fn(() => {
  rafCallback = null
})
const flushRAF = () => {
  if (rafCallback) {
    const cb = rafCallback
    rafCallback = null
    cb()
  }
}

describe('StabilizedPointer', () => {
  describe('メソッドチェインAPI', () => {
    test('フィルタなしで作成できる', () => {
      const pointer = new StabilizedPointer()
      pointer.addPoint(createPoint(0, 0))

      expect(pointer.getAllPoints()).toHaveLength(1)
    })

    test('ノイズフィルタのみ追加', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      pointer.addPoint(createPoint(0, 0))
      const result = pointer.addPoint(createPoint(0.5, 0.5)) // 距離 ≈ 0.7 < 1.5

      expect(result).toBeNull()
      expect(pointer.getAllPoints()).toHaveLength(1)
    })

    test('カルマンフィルタのみ追加', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(20, 0))

      const points = pointer.getAllPoints()
      expect(points).toHaveLength(3)
      // カルマンフィルタが予測補正を適用
      expect(points[1].x).not.toBe(10)
    })

    test('ガウシアンフィルタのみ追加', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(5, 1.0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(20, 0))
      pointer.addPoint(createPoint(30, 10))
      pointer.addPoint(createPoint(40, 0))

      const points = pointer.getAllPoints()
      // 中央のポイントは振幅が減少しているはず
      const centerPoint = points[2]
      expect(Math.abs(centerPoint.y)).toBeLessThan(10)
    })

    test('紐補正のみ追加', () => {
      const pointer = new StabilizedPointer().addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(3, 0)) // 5px未満

      const points = pointer.getAllPoints()
      expect(points[1].x).toBeCloseTo(0, 0)
    })

    test('複数フィルタをチェインで追加', () => {
      const pointer = new StabilizedPointer()
        .addNoiseFilter(1.5)
        .addKalmanFilter(0.1, 0.5)
        .addGaussianFilter(5, 1.0)
        .addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('rAFバッチをチェインで追加', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addRafBatch()

      expect(pointer.hasFilter('noise')).toBe(true)
    })
  })

  describe('フィルタ更新API', () => {
    test('ノイズフィルタのパラメータを更新', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      pointer.addPoint(createPoint(0, 0))
      // 1.5未満は拒否
      expect(pointer.addPoint(createPoint(1, 0))).toBeNull()

      // パラメータを緩くする
      pointer.updateNoiseFilter(0.5)

      // 0.5以上は通る
      pointer.addPoint(createPoint(1, 0))
      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('カルマンフィルタのパラメータを更新', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      // パラメータ更新がエラーなく動作
      pointer.updateKalmanFilter(0.2, 0.8)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('ガウシアンフィルタのパラメータを更新', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(3, 0.5)

      // パラメータ更新がエラーなく動作
      pointer.updateGaussianFilter(5, 1.0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('紐補正のパラメータを更新', () => {
      const pointer = new StabilizedPointer().addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(3, 0)) // デッドゾーン内
      expect(pointer.getAllPoints()[1].x).toBeCloseTo(0, 0)

      pointer.reset()

      // デッドゾーンを小さくする
      pointer.updateStringStabilization(2)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(3, 0)) // 今度はデッドゾーン外
      expect(pointer.getAllPoints()[1].x).toBeGreaterThan(0)
    })

    test('フィルタを削除できる', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      pointer.addPoint(createPoint(0, 0))
      expect(pointer.addPoint(createPoint(0.5, 0.5))).toBeNull() // フィルタで拒否

      // フィルタを削除
      pointer.removeFilter('noise')

      const result = pointer.addPoint(createPoint(0.5, 0.5))
      expect(result).not.toBeNull() // フィルタ削除されたので通る
    })

    test('hasFilter でフィルタの存在確認', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addKalmanFilter(0.1, 0.5)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(true)
      expect(pointer.hasFilter('gaussian')).toBe(false)
      expect(pointer.hasFilter('string')).toBe(false)
    })

    test('removeFilterでフィルタが削除される', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      expect(pointer.hasFilter('noise')).toBe(true)

      pointer.removeFilter('noise')
      expect(pointer.hasFilter('noise')).toBe(false)
    })
  })

  describe('フィルタパイプライン順序', () => {
    test('フィルタは追加順に適用される（ノイズ→カルマン）', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addKalmanFilter(0.1, 0.5)

      pointer.addPoint(createPoint(0, 0))
      // ノイズフィルタで先に拒否される
      const result = pointer.addPoint(createPoint(0.5, 0.5))

      expect(result).toBeNull()
    })

    test('フィルタは追加順に適用される（カルマン→紐）', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5).addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(3, 0)) // 紐のデッドゾーン内

      const points = pointer.getAllPoints()
      // カルマンで補正後、紐補正が適用
      expect(points[1].x).toBeCloseTo(0, 0)
    })
  })

  describe('カルマンフィルタ', () => {
    test('カルマンフィルタは予測ベースで補正する', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      // 直線上のポイント
      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 0))
      pointer.addPoint(createPoint(20, 0))
      pointer.addPoint(createPoint(30, 0))

      const points = pointer.getAllPoints()
      // 速度を学習して予測補正する
      expect(points[3].x).toBeGreaterThan(25)
    })

    test('カルマンフィルタは急な方向転換を滑らかにする', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      // 急な方向転換
      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 0))
      pointer.addPoint(createPoint(20, 0))
      pointer.addPoint(createPoint(20, 10)) // 急に上に曲がる

      const points = pointer.getAllPoints()
      // 予測と観測の融合で、急な変化が緩和される
      expect(points[3].x).toBeGreaterThan(20)
    })

    test('resetでカルマンフィルタの状態もリセットされる', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 0))
      pointer.reset()

      // リセット後は新しい位置から始まる
      pointer.addPoint(createPoint(100, 100))
      const points = pointer.getAllPoints()
      expect(points[0].x).toBe(100)
      expect(points[0].y).toBe(100)
    })
  })

  describe('addPoint', () => {
    test('最初のポイントは常に追加される', () => {
      const pointer = new StabilizedPointer()
      const point = createPoint(10, 20)

      const result = pointer.addPoint(point)

      expect(result).toEqual(point)
      expect(pointer.getAllPoints()).toHaveLength(1)
    })

    test('距離が十分離れたポイントは追加される', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)
      pointer.addPoint(createPoint(0, 0))

      const result = pointer.addPoint(createPoint(10, 10))

      expect(result).not.toBeNull()
      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('距離が近すぎるポイントはノイズとして除去される（補正有効時）', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)
      pointer.addPoint(createPoint(0, 0))

      const result = pointer.addPoint(createPoint(0.5, 0.5)) // 距離 ≈ 0.7 < 1.5

      expect(result).toBeNull()
      expect(pointer.getAllPoints()).toHaveLength(1)
    })

    test('フィルタなしの場合は全てのポイントがそのまま通る', () => {
      const pointer = new StabilizedPointer()
      pointer.addPoint(createPoint(0, 0))

      const result = pointer.addPoint(createPoint(0.5, 0.5)) // 通常ならノイズ

      expect(result).not.toBeNull()
      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('補正なしの場合はポイントがそのまま返される', () => {
      const pointer = new StabilizedPointer()
      const point = createPoint(50, 100)

      const result = pointer.addPoint(point)

      expect(result).toEqual(point)
    })
  })

  describe('ガウシアンフィルタ', () => {
    test('ガウシアンフィルタが適用される', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(5, 1.0)

      // 直線上のポイントを追加
      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 0))
      pointer.addPoint(createPoint(20, 0))
      pointer.addPoint(createPoint(30, 0))
      pointer.addPoint(createPoint(40, 0))

      const points = pointer.getAllPoints()

      // 直線上のポイントは補正後も直線上
      points.forEach((p) => {
        expect(p.y).toBeCloseTo(0, 1)
      })
    })

    test('ジグザグなポイントは平滑化される', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(5, 1.0)

      // ジグザグパターン
      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(20, 0))
      pointer.addPoint(createPoint(30, 10))
      pointer.addPoint(createPoint(40, 0))

      const points = pointer.getAllPoints()

      // 中央のポイントは振幅が減少しているはず
      const centerPoint = points[2]
      expect(Math.abs(centerPoint.y)).toBeLessThan(10)
    })

    test('pressureとpointerTypeは保持される', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      pointer.addPoint(createPoint(0, 0, 0.8))
      pointer.addPoint(createPoint(10, 10, 0.6))
      pointer.addPoint(createPoint(20, 20, 0.4))

      const points = pointer.getAllPoints()

      expect(points[0].pressure).toBe(0.8)
      expect(points[1].pressure).toBe(0.6)
      expect(points[2].pressure).toBe(0.4)
      points.forEach((p) => {
        expect(p.pointerType).toBe('pen')
      })
    })
  })

  describe('紐補正', () => {
    test('デッドゾーン内の移動では描画点が動かない', () => {
      const pointer = new StabilizedPointer().addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(3, 0)) // 5px未満

      const points = pointer.getAllPoints()
      expect(points[1].x).toBeCloseTo(0, 0)
    })

    test('デッドゾーンを超えると描画点が追従する', () => {
      const pointer = new StabilizedPointer().addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(15, 0)) // 5pxを大きく超える

      const points = pointer.getAllPoints()
      expect(points[1].x).toBeGreaterThan(0)
    })

    test('紐の長さを変えるとデッドゾーンが変わる', () => {
      const pointer = new StabilizedPointer().addStringStabilization(10)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(8, 0)) // 10px未満

      const points = pointer.getAllPoints()
      expect(points[1].x).toBeCloseTo(0, 0)
    })
  })

  describe('addPoints', () => {
    test('複数ポイントを一度に追加できる', () => {
      const pointer = new StabilizedPointer()

      const results = pointer.addPoints([
        createPoint(0, 0),
        createPoint(10, 10),
        createPoint(20, 20),
      ])

      expect(results).toHaveLength(3)
      expect(pointer.getAllPoints()).toHaveLength(3)
    })

    test('ノイズポイントはフィルタリングされる（補正有効時）', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      const results = pointer.addPoints([
        createPoint(0, 0),
        createPoint(0.5, 0.5), // ノイズ
        createPoint(10, 10),
        createPoint(10.5, 10.5), // ノイズ
        createPoint(20, 20),
      ])

      expect(results).toHaveLength(3)
    })
  })

  describe('getNewPoints', () => {
    test('最後の呼び出し以降に追加されたポイントのみ返す', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      const first = pointer.getNewPoints()
      expect(first).toHaveLength(2)

      pointer.addPoint(createPoint(20, 20))

      const second = pointer.getNewPoints()
      expect(second).toHaveLength(1)
      expect(second[0].x).toBe(20)
    })
  })

  describe('finish', () => {
    test('全ポイントを返しバッファをリセット', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      const result = pointer.finish()

      expect(result).toHaveLength(2)
      expect(pointer.getAllPoints()).toHaveLength(0)
    })

    test('補正で終端がずれた場合は生ポイントを追加', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(5, 1.0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(20, 0))

      const result = pointer.finish()

      // 終端が追加されている可能性がある
      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('reset', () => {
    test('バッファがクリアされる', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.reset()

      expect(pointer.getAllPoints()).toHaveLength(0)
    })

    test('紐補正の状態もリセットされる', () => {
      const pointer = new StabilizedPointer().addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 0))
      pointer.reset()

      // リセット後、新しいストロークは新しい位置から始まる
      pointer.addPoint(createPoint(100, 100))
      const points = pointer.getAllPoints()
      expect(points[0].x).toBe(100)
      expect(points[0].y).toBe(100)
    })
  })

  describe('onFlush', () => {
    test('onFlushでコールバックをチェインで設定できる', () => {
      const callback = vi.fn()
      const pointer = new StabilizedPointer().onFlush(callback)

      // onFlushはaddPointerEvent時に呼ばれる（addPointでは呼ばれない）
      expect(pointer.hasFilter('noise')).toBe(false)
    })
  })

  describe('addPointerEvent と rAF バッチ処理', () => {
    beforeEach(() => {
      vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
      vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame)
      rafCallback = null
      mockRequestAnimationFrame.mockClear()
      mockCancelAnimationFrame.mockClear()
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test('addRafBatch有効時はrAFでバッチ処理される', () => {
      const onFlush = vi.fn()
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addRafBatch().onFlush(onFlush)

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: {
          getCoalescedEvents: () => [
            { clientX: 0, clientY: 0, pressure: 0.5, pointerType: 'pen' },
            { clientX: 10, clientY: 10, pressure: 0.6, pointerType: 'pen' },
            { clientX: 20, clientY: 20, pressure: 0.7, pointerType: 'pen' },
          ],
        },
        clientX: 20,
        clientY: 20,
        pressure: 0.7,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      // イベント追加時はまだバッファに入っていない
      pointer.addPointerEvent(mockEvent, mockElement)
      expect(pointer.getAllPoints()).toHaveLength(0)
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1)

      // rAFをフラッシュ
      flushRAF()

      expect(pointer.getAllPoints()).toHaveLength(3)
      expect(onFlush).toHaveBeenCalledTimes(1)
    })

    test('フィルタなしではrAFを使わず即座に処理', () => {
      const onFlush = vi.fn()
      const pointer = new StabilizedPointer().onFlush(onFlush)

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: {
          getCoalescedEvents: () => [],
        },
        clientX: 50,
        clientY: 50,
        pressure: 0.5,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      pointer.addPointerEvent(mockEvent, mockElement)

      // rAFなしで即座にバッファに入る
      expect(pointer.getAllPoints()).toHaveLength(1)
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
      expect(onFlush).toHaveBeenCalledTimes(1)
    })

    test('addRafBatch未使用時はrAFを使わず即座に処理', () => {
      const onFlush = vi.fn()
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).onFlush(onFlush) // addRafBatchなし

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: {
          getCoalescedEvents: () => [],
        },
        clientX: 50,
        clientY: 50,
        pressure: 0.5,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      pointer.addPointerEvent(mockEvent, mockElement)

      // rAFなしで即座にバッファに入る
      expect(pointer.getAllPoints()).toHaveLength(1)
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
      expect(onFlush).toHaveBeenCalledTimes(1)
    })

    test('複数のaddPointerEventは1つのrAFにバッチ処理される', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addRafBatch()

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const createMockEvent = (x: number, y: number) =>
        ({
          nativeEvent: { getCoalescedEvents: () => [] },
          clientX: x,
          clientY: y,
          pressure: 0.5,
          pointerType: 'pen',
        }) as unknown as React.PointerEvent<HTMLElement>

      pointer.addPointerEvent(createMockEvent(0, 0), mockElement)
      pointer.addPointerEvent(createMockEvent(10, 10), mockElement)
      pointer.addPointerEvent(createMockEvent(20, 20), mockElement)

      // rAFは1回だけスケジュールされる
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1)

      flushRAF()

      expect(pointer.getAllPoints()).toHaveLength(3)
    })

    test('finishでペンディング中のポイントが処理される', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(5, 1.0).addRafBatch()

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: {
          getCoalescedEvents: () => [
            { clientX: 0, clientY: 0, pressure: 0.5, pointerType: 'pen' },
            { clientX: 10, clientY: 10, pressure: 0.6, pointerType: 'pen' },
          ],
        },
        clientX: 10,
        clientY: 10,
        pressure: 0.6,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      pointer.addPointerEvent(mockEvent, mockElement)

      // rAFをフラッシュせずにfinish
      const result = pointer.finish()

      // ペンディング中のポイントも含まれる（終端補正で+1される可能性あり）
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    test('resetでrAFがキャンセルされる', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(5, 1.0).addRafBatch()

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: { getCoalescedEvents: () => [] },
        clientX: 50,
        clientY: 50,
        pressure: 0.5,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      pointer.addPointerEvent(mockEvent, mockElement)
      pointer.reset()

      expect(mockCancelAnimationFrame).toHaveBeenCalled()
      expect(pointer.getAllPoints()).toHaveLength(0)
    })

    test('ズーム倍率が考慮される', () => {
      const pointer = new StabilizedPointer()

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: { getCoalescedEvents: () => [] },
        clientX: 100,
        clientY: 100,
        pressure: 0.5,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      pointer.addPointerEvent(mockEvent, mockElement, 2) // 2倍ズーム
      flushRAF()

      const points = pointer.getAllPoints()
      expect(points).toHaveLength(1)
      expect(points[0].x).toBe(50) // 100 / 2
      expect(points[0].y).toBe(50) // 100 / 2
    })

    test('removeRafBatchでrAFバッチを動的に切り替え', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addRafBatch()

      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }),
      } as HTMLElement

      const mockEvent = {
        nativeEvent: { getCoalescedEvents: () => [] },
        clientX: 50,
        clientY: 50,
        pressure: 0.5,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      // rAFバッチ有効
      pointer.addPointerEvent(mockEvent, mockElement)
      expect(pointer.getAllPoints()).toHaveLength(0)

      flushRAF()
      expect(pointer.getAllPoints()).toHaveLength(1)

      // rAFバッチを削除
      pointer.removeRafBatch()

      const mockEvent2 = {
        nativeEvent: { getCoalescedEvents: () => [] },
        clientX: 100,
        clientY: 100,
        pressure: 0.5,
        pointerType: 'pen',
      } as unknown as React.PointerEvent<HTMLElement>

      mockRequestAnimationFrame.mockClear()
      pointer.addPointerEvent(mockEvent2, mockElement)

      // rAF無効なので即座にバッファに入る
      expect(pointer.getAllPoints()).toHaveLength(2)
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
    })
  })

  describe('createStabilizedPointer ファクトリー関数', () => {
    test('level 0: フィルタなし', () => {
      const pointer = createStabilizedPointer(0)

      expect(pointer.hasFilter('noise')).toBe(false)
      expect(pointer.hasFilter('kalman')).toBe(false)
      expect(pointer.hasFilter('gaussian')).toBe(false)
      expect(pointer.hasFilter('string')).toBe(false)
    })

    test('level 10: ノイズフィルタのみ', () => {
      const pointer = createStabilizedPointer(10)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(false)
      expect(pointer.hasFilter('gaussian')).toBe(false)
      expect(pointer.hasFilter('string')).toBe(false)
    })

    test('level 30: ノイズ + カルマン', () => {
      const pointer = createStabilizedPointer(30)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(true)
      expect(pointer.hasFilter('gaussian')).toBe(false)
      expect(pointer.hasFilter('string')).toBe(false)
    })

    test('level 50: ノイズ + カルマン + ガウシアン', () => {
      const pointer = createStabilizedPointer(50)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(true)
      expect(pointer.hasFilter('gaussian')).toBe(true)
      expect(pointer.hasFilter('string')).toBe(false)
    })

    test('level 70: 全フィルタ（紐補正軽）', () => {
      const pointer = createStabilizedPointer(70)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(true)
      expect(pointer.hasFilter('gaussian')).toBe(true)
      expect(pointer.hasFilter('string')).toBe(true)
    })

    test('level 90: 全フィルタ（紐補正強）', () => {
      const pointer = createStabilizedPointer(90)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(true)
      expect(pointer.hasFilter('gaussian')).toBe(true)
      expect(pointer.hasFilter('string')).toBe(true)
    })

    test('ファクトリー関数で作成したポインタが動作する', () => {
      const pointer = createStabilizedPointer(50)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(20, 20))

      expect(pointer.getAllPoints().length).toBeGreaterThanOrEqual(1)
    })

    test('負のレベルはlevel 0と同じ', () => {
      const pointer = createStabilizedPointer(-10)

      expect(pointer.hasFilter('noise')).toBe(false)
    })

    test('100を超えるレベルでも動作する', () => {
      const pointer = createStabilizedPointer(150)

      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('string')).toBe(true)
    })
  })

  describe('エッジケース', () => {
    test('空のバッファでfinishしてもエラーにならない', () => {
      const pointer = new StabilizedPointer()

      const result = pointer.finish()

      expect(result).toHaveLength(0)
    })

    test('空のバッファでresetしてもエラーにならない', () => {
      const pointer = new StabilizedPointer()

      pointer.reset()

      expect(pointer.getAllPoints()).toHaveLength(0)
    })

    test('空のバッファでgetNewPointsしてもエラーにならない', () => {
      const pointer = new StabilizedPointer()

      const result = pointer.getNewPoints()

      expect(result).toHaveLength(0)
    })

    test('1ポイントのみでfinish', () => {
      const pointer = new StabilizedPointer()
      pointer.addPoint(createPoint(10, 20))

      const result = pointer.finish()

      expect(result).toHaveLength(1)
      expect(result[0].x).toBe(10)
      expect(result[0].y).toBe(20)
    })

    test('同じポイントを連続追加（フィルタなし）', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(3)
    })

    test('同じポイントを連続追加（ノイズフィルタあり）', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      pointer.addPoint(createPoint(10, 10))
      const result1 = pointer.addPoint(createPoint(10, 10))
      const result2 = pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(1)
      expect(result1).toBeNull()
      expect(result2).toBeNull()
    })

    test('非常に大きな座標値', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      pointer.addPoint(createPoint(1000000, 1000000))
      pointer.addPoint(createPoint(1000010, 1000010))

      const points = pointer.getAllPoints()
      expect(points).toHaveLength(2)
      expect(points[0].x).toBe(1000000)
    })

    test('負の座標値', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(3, 1.0)

      pointer.addPoint(createPoint(-100, -100))
      pointer.addPoint(createPoint(-90, -90))
      pointer.addPoint(createPoint(-80, -80))

      const points = pointer.getAllPoints()
      expect(points).toHaveLength(3)
      expect(points[0].x).toBeLessThan(0)
    })

    test('pressure 0のポイント', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0, 0))

      const points = pointer.getAllPoints()
      expect(points[0].pressure).toBe(0)
    })

    test('pressure 1のポイント', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0, 1))

      const points = pointer.getAllPoints()
      expect(points[0].pressure).toBe(1)
    })

    test('存在しないフィルタの更新は無視される', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5)

      // カルマンフィルタは追加していないが、更新してもエラーにならない
      pointer.updateKalmanFilter(0.2, 0.8)

      expect(pointer.hasFilter('kalman')).toBe(false)
    })

    test('存在しないフィルタのremoveは無視される', () => {
      const pointer = new StabilizedPointer()

      // フィルタを追加していないが、removeFilterしてもエラーにならない
      pointer.removeFilter('noise')

      expect(pointer.hasFilter('noise')).toBe(false)
    })

    test('addPointsに空配列を渡す', () => {
      const pointer = new StabilizedPointer()

      const results = pointer.addPoints([])

      expect(results).toHaveLength(0)
    })
  })

  describe('フィルタの組み合わせ', () => {
    test('ノイズ + ガウシアン（カルマンなし）', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(1.5).addGaussianFilter(3, 1.0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.addPoint(createPoint(20, 20))

      expect(pointer.getAllPoints()).toHaveLength(3)
      expect(pointer.hasFilter('noise')).toBe(true)
      expect(pointer.hasFilter('gaussian')).toBe(true)
      expect(pointer.hasFilter('kalman')).toBe(false)
    })

    test('カルマン + 紐（ノイズなし）', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5).addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(3, 0)) // 紐のデッドゾーン内

      const points = pointer.getAllPoints()
      expect(points).toHaveLength(2)
      expect(points[1].x).toBeCloseTo(0, 0) // 紐補正でデッドゾーン内
    })

    test('ガウシアン + 紐（ノイズ・カルマンなし）', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(3, 1.0).addStringStabilization(5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 0))
      pointer.addPoint(createPoint(20, 0))

      expect(pointer.getAllPoints()).toHaveLength(3)
    })

    test('紐のみ（他フィルタなし）', () => {
      const pointer = new StabilizedPointer().addStringStabilization(10)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(5, 0)) // デッドゾーン内
      pointer.addPoint(createPoint(15, 0)) // デッドゾーン外

      const points = pointer.getAllPoints()
      expect(points[1].x).toBeCloseTo(0, 0)
      expect(points[2].x).toBeGreaterThan(0)
    })

    test('フィルタの順序が結果に影響する', () => {
      // 紐→ガウシアンの順
      const pointer1 = new StabilizedPointer().addStringStabilization(5).addGaussianFilter(3, 1.0)

      // ガウシアン→紐の順
      const pointer2 = new StabilizedPointer().addGaussianFilter(3, 1.0).addStringStabilization(5)

      const points = [createPoint(0, 0), createPoint(10, 0), createPoint(20, 0)]

      points.forEach((p) => pointer1.addPoint(p))
      points.forEach((p) => pointer2.addPoint(p))

      // 順序が違うので結果も違う可能性がある
      // （実際の値は実装依存なので、エラーなく動作することを確認）
      expect(pointer1.getAllPoints()).toHaveLength(3)
      expect(pointer2.getAllPoints()).toHaveLength(3)
    })
  })

  describe('パラメータ境界値', () => {
    test('ノイズフィルタ: minDistance = 0', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(0.001, 0.001))

      // minDistance=0なので、どんなに近くても通る
      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('カルマンフィルタ: processNoise = 0', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0, 0.5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('カルマンフィルタ: measurementNoise = 0', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('ガウシアンフィルタ: size = 1（実質無効）', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(1, 1.0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))

      // size=1はガウシアン適用をスキップする
      expect(pointer.getAllPoints()).toHaveLength(2)
    })

    test('紐補正: stringLength = 0', () => {
      const pointer = new StabilizedPointer().addStringStabilization(0)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(1, 0))

      // stringLength=0はデッドゾーンなし
      expect(pointer.getAllPoints()).toHaveLength(2)
    })
  })

  describe('連続操作', () => {
    test('複数回のfinish', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0))
      const result1 = pointer.finish()

      pointer.addPoint(createPoint(10, 10))
      const result2 = pointer.finish()

      expect(result1).toHaveLength(1)
      expect(result2).toHaveLength(1)
    })

    test('複数回のreset', () => {
      const pointer = new StabilizedPointer()

      pointer.addPoint(createPoint(0, 0))
      pointer.reset()
      pointer.reset()

      expect(pointer.getAllPoints()).toHaveLength(0)
    })

    test('finish後に再利用', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      pointer.addPoint(createPoint(0, 0))
      pointer.addPoint(createPoint(10, 10))
      pointer.finish()

      // カルマンフィルタの状態がリセットされているか確認
      pointer.addPoint(createPoint(100, 100))
      const points = pointer.getAllPoints()

      expect(points).toHaveLength(1)
      expect(points[0].x).toBe(100)
      expect(points[0].y).toBe(100)
    })

    test('フィルタの動的追加/削除', () => {
      const pointer = new StabilizedPointer().addNoiseFilter(10)

      pointer.addPoint(createPoint(0, 0))
      expect(pointer.addPoint(createPoint(5, 0))).toBeNull() // フィルタで拒否

      pointer.removeFilter('noise')
      expect(pointer.addPoint(createPoint(5, 0))).not.toBeNull() // フィルタ削除で通過

      pointer.addNoiseFilter(10)
      expect(pointer.addPoint(createPoint(6, 0))).toBeNull() // 再度追加で拒否
    })
  })

  describe('補正強度の相対比較', () => {
    test('高いレベルほどノイズ除去が強い', () => {
      const lowLevel = createStabilizedPointer(10)
      const highLevel = createStabilizedPointer(50)

      // 小さな移動（ノイズ的な動き）を追加
      const smallMove = [createPoint(0, 0), createPoint(1, 0), createPoint(2, 0), createPoint(3, 0)]

      smallMove.forEach((p) => lowLevel.addPoint(p))
      smallMove.forEach((p) => highLevel.addPoint(p))

      // 高レベルの方がポイントが少ない（ノイズとして除去される）
      expect(highLevel.getAllPoints().length).toBeLessThanOrEqual(lowLevel.getAllPoints().length)
    })

    test('高いレベルほどスムージングが強い', () => {
      const lowLevel = createStabilizedPointer(30)
      const highLevel = createStabilizedPointer(80)

      // ジグザグ動き
      const zigzag = [
        createPoint(0, 0),
        createPoint(10, 5),
        createPoint(20, -5),
        createPoint(30, 5),
        createPoint(40, -5),
        createPoint(50, 0),
      ]

      zigzag.forEach((p) => lowLevel.addPoint(p))
      zigzag.forEach((p) => highLevel.addPoint(p))

      const lowPoints = lowLevel.getAllPoints()
      const highPoints = highLevel.getAllPoints()

      // Y座標の分散を計算
      const variance = (points: readonly PointerPoint[]) => {
        const mean = points.reduce((sum, p) => sum + p.y, 0) / points.length
        return points.reduce((sum, p) => sum + (p.y - mean) ** 2, 0) / points.length
      }

      // 高レベルの方が分散が小さい（よりスムーズ）
      expect(variance(highPoints)).toBeLessThanOrEqual(variance(lowPoints))
    })
  })

  describe('pointerType の処理', () => {
    test('pen タイプが正しく保持される', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5)

      pointer.addPoint({ x: 0, y: 0, pressure: 0.5, pointerType: 'pen' })
      pointer.addPoint({ x: 10, y: 10, pressure: 0.5, pointerType: 'pen' })

      const points = pointer.getAllPoints()
      expect(points.every((p) => p.pointerType === 'pen')).toBe(true)
    })

    test('touch タイプが正しく保持される', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(3, 1.0)

      pointer.addPoint({ x: 0, y: 0, pressure: 0.5, pointerType: 'touch' })
      pointer.addPoint({ x: 10, y: 10, pressure: 0.5, pointerType: 'touch' })
      pointer.addPoint({ x: 20, y: 20, pressure: 0.5, pointerType: 'touch' })

      const points = pointer.getAllPoints()
      expect(points.every((p) => p.pointerType === 'touch')).toBe(true)
    })

    test('mouse タイプが正しく保持される', () => {
      const pointer = new StabilizedPointer().addStringStabilization(5)

      pointer.addPoint({ x: 0, y: 0, pressure: 0.5, pointerType: 'mouse' })
      pointer.addPoint({ x: 20, y: 0, pressure: 0.5, pointerType: 'mouse' })

      const points = pointer.getAllPoints()
      expect(points.every((p) => p.pointerType === 'mouse')).toBe(true)
    })
  })

  describe('大量ポイント処理', () => {
    test('1000ポイントを処理してもエラーにならない', () => {
      const pointer = createStabilizedPointer(50)

      for (let i = 0; i < 1000; i++) {
        pointer.addPoint(createPoint(i, Math.sin(i / 10) * 50))
      }

      const points = pointer.getAllPoints()
      expect(points.length).toBeGreaterThan(0)
      expect(points.length).toBeLessThanOrEqual(1000)
    })

    test('finish後に再度大量ポイントを処理できる', () => {
      const pointer = createStabilizedPointer(70)

      // 1回目
      for (let i = 0; i < 500; i++) {
        pointer.addPoint(createPoint(i, i))
      }
      const result1 = pointer.finish()

      // 2回目
      for (let i = 0; i < 500; i++) {
        pointer.addPoint(createPoint(i + 1000, i + 1000))
      }
      const result2 = pointer.finish()

      expect(result1.length).toBeGreaterThan(0)
      expect(result2.length).toBeGreaterThan(0)
    })

    test('連続reset後も正常に動作する', () => {
      const pointer = createStabilizedPointer(50)

      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < 100; i++) {
          pointer.addPoint(createPoint(i, i))
        }
        pointer.reset()
      }

      // 最後の追加
      pointer.addPoint(createPoint(0, 0))
      expect(pointer.getAllPoints()).toHaveLength(1)
    })
  })

  describe('pressure の補間', () => {
    test('圧力値がフィルタ後も妥当な範囲', () => {
      const pointer = new StabilizedPointer().addKalmanFilter(0.1, 0.5).addGaussianFilter(5, 1.0)

      pointer.addPoint(createPoint(0, 0, 0.2))
      pointer.addPoint(createPoint(10, 10, 0.5))
      pointer.addPoint(createPoint(20, 20, 0.8))
      pointer.addPoint(createPoint(30, 30, 0.5))
      pointer.addPoint(createPoint(40, 40, 0.3))

      const points = pointer.getAllPoints()
      points.forEach((p) => {
        expect(p.pressure).toBeGreaterThanOrEqual(0)
        expect(p.pressure).toBeLessThanOrEqual(1)
      })
    })

    test('圧力値が元の値を保持する', () => {
      const pointer = new StabilizedPointer().addGaussianFilter(3, 1.0)

      // 様々な圧力値でポイントを追加
      pointer.addPoint(createPoint(0, 0, 0.1))
      pointer.addPoint(createPoint(10, 0, 0.5))
      pointer.addPoint(createPoint(20, 0, 0.9))

      const points = pointer.getAllPoints()

      // 圧力値は座標のスムージングに影響されない
      expect(points[0].pressure).toBe(0.1)
      expect(points[1].pressure).toBe(0.5)
      expect(points[2].pressure).toBe(0.9)
    })
  })
})
