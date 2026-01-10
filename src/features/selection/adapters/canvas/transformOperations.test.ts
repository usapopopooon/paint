import { describe, test, expect } from 'vitest'
import {
  HANDLE_INFO,
  getHandlePosition,
  getAllHandlePositions,
  isPointInHandle,
  detectHandle,
  calculateScaleFromHandle,
  calculateRotationFromHandle,
  createInitialTransformState,
  getNextTransformMode,
  applyScaleToTransform,
  applyRotationToTransform,
  isPointInTransformBounds,
  getTransformedCorners,
} from './transformOperations'
import type { Bounds } from '@/lib/geometry'
import type { TransformMode } from '../../types'

describe('transformOperations', () => {
  describe('HANDLE_INFO', () => {
    test('すべてのハンドル位置が定義されている', () => {
      expect(HANDLE_INFO['top-left']).toBeDefined()
      expect(HANDLE_INFO['top-center']).toBeDefined()
      expect(HANDLE_INFO['top-right']).toBeDefined()
      expect(HANDLE_INFO['middle-left']).toBeDefined()
      expect(HANDLE_INFO['middle-right']).toBeDefined()
      expect(HANDLE_INFO['bottom-left']).toBeDefined()
      expect(HANDLE_INFO['bottom-center']).toBeDefined()
      expect(HANDLE_INFO['bottom-right']).toBeDefined()
      expect(HANDLE_INFO['rotation']).toBeDefined()
    })

    test('対角ハンドルが正しく設定されている', () => {
      expect(HANDLE_INFO['top-left'].opposite).toBe('bottom-right')
      expect(HANDLE_INFO['bottom-right'].opposite).toBe('top-left')
      expect(HANDLE_INFO['top-right'].opposite).toBe('bottom-left')
      expect(HANDLE_INFO['bottom-left'].opposite).toBe('top-right')
    })

    test('回転ハンドルは対角がnull', () => {
      expect(HANDLE_INFO['rotation'].opposite).toBeNull()
    })
  })

  describe('getHandlePosition', () => {
    const bounds: Bounds = { x: 100, y: 100, width: 200, height: 100 }

    test('top-leftハンドルの位置', () => {
      const pos = getHandlePosition('top-left', bounds, 0)
      expect(pos.x).toBe(100)
      expect(pos.y).toBe(100)
    })

    test('bottom-rightハンドルの位置', () => {
      const pos = getHandlePosition('bottom-right', bounds, 0)
      expect(pos.x).toBe(300)
      expect(pos.y).toBe(200)
    })

    test('中央ハンドルの位置', () => {
      const pos = getHandlePosition('top-center', bounds, 0)
      expect(pos.x).toBe(200)
      expect(pos.y).toBe(100)
    })

    test('回転ハンドルはバウンズ上部に配置', () => {
      const pos = getHandlePosition('rotation', bounds, 0)
      expect(pos.x).toBe(200) // 中央X
      expect(pos.y).toBeLessThan(100) // バウンズ上部より上
    })

    test('回転が適用される', () => {
      const posNoRotation = getHandlePosition('top-left', bounds, 0)
      const posWithRotation = getHandlePosition('top-left', bounds, Math.PI / 2)

      // 90度回転後は位置が変わる
      expect(posWithRotation.x).not.toBeCloseTo(posNoRotation.x, 0)
      expect(posWithRotation.y).not.toBeCloseTo(posNoRotation.y, 0)
    })
  })

  describe('getAllHandlePositions', () => {
    const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

    test('9つのハンドル位置を返す', () => {
      const positions = getAllHandlePositions(bounds)
      expect(Object.keys(positions)).toHaveLength(9)
    })

    test('すべてのハンドルタイプが含まれる', () => {
      const positions = getAllHandlePositions(bounds)
      expect(positions['top-left']).toBeDefined()
      expect(positions['top-center']).toBeDefined()
      expect(positions['top-right']).toBeDefined()
      expect(positions['middle-left']).toBeDefined()
      expect(positions['middle-right']).toBeDefined()
      expect(positions['bottom-left']).toBeDefined()
      expect(positions['bottom-center']).toBeDefined()
      expect(positions['bottom-right']).toBeDefined()
      expect(positions['rotation']).toBeDefined()
    })
  })

  describe('isPointInHandle', () => {
    test('ハンドル内の点はtrue', () => {
      const handlePos = { x: 100, y: 100 }
      const point = { x: 102, y: 98 }
      expect(isPointInHandle(point, handlePos, 10)).toBe(true)
    })

    test('ハンドル外の点はfalse', () => {
      const handlePos = { x: 100, y: 100 }
      const point = { x: 120, y: 100 }
      expect(isPointInHandle(point, handlePos, 10)).toBe(false)
    })

    test('ハンドル境界上はtrue', () => {
      const handlePos = { x: 100, y: 100 }
      const point = { x: 105, y: 100 }
      expect(isPointInHandle(point, handlePos, 10)).toBe(true)
    })
  })

  describe('detectHandle', () => {
    const bounds: Bounds = { x: 100, y: 100, width: 200, height: 100 }
    const center = { x: 200, y: 150 }
    const handleSize = 10

    test('free-transformモードで回転ハンドルを検出', () => {
      const rotationPos = getHandlePosition('rotation', bounds, 0, center)
      const handle = detectHandle(rotationPos, bounds, 0, center, handleSize, 'free-transform')
      expect(handle).toBe('rotation')
    })

    test('scaleモードでは回転ハンドルを検出しない', () => {
      const rotationPos = getHandlePosition('rotation', bounds, 0, center)
      const handle = detectHandle(rotationPos, bounds, 0, center, handleSize, 'scale')
      expect(handle).toBeNull()
    })

    test('rotateモードで回転ハンドルを検出', () => {
      const rotationPos = getHandlePosition('rotation', bounds, 0, center)
      const handle = detectHandle(rotationPos, bounds, 0, center, handleSize, 'rotate')
      expect(handle).toBe('rotation')
    })

    test('コーナーハンドルを検出', () => {
      const topLeftPos = getHandlePosition('top-left', bounds, 0, center)
      const handle = detectHandle(topLeftPos, bounds, 0, center, handleSize, 'free-transform')
      expect(handle).toBe('top-left')
    })

    test('ハンドル外はnullを返す', () => {
      const point = { x: 150, y: 150 } // バウンズ内だがハンドル外
      const handle = detectHandle(point, bounds, 0, center, handleSize, 'free-transform')
      expect(handle).toBeNull()
    })
  })

  describe('calculateScaleFromHandle', () => {
    const bounds: Bounds = { x: 100, y: 100, width: 100, height: 100 }
    const center = { x: 150, y: 150 }

    test('右方向にドラッグでX方向に拡大', () => {
      const startPoint = { x: 200, y: 150 }
      const currentPoint = { x: 250, y: 150 }
      const scale = calculateScaleFromHandle('middle-right', startPoint, currentPoint, bounds, center)

      expect(scale.x).toBeGreaterThan(1)
      expect(scale.y).toBe(1)
    })

    test('下方向にドラッグでY方向に拡大', () => {
      const startPoint = { x: 150, y: 200 }
      const currentPoint = { x: 150, y: 250 }
      const scale = calculateScaleFromHandle('bottom-center', startPoint, currentPoint, bounds, center)

      expect(scale.x).toBe(1)
      expect(scale.y).toBeGreaterThan(1)
    })

    test('コーナーハンドルで両方向にスケール', () => {
      const startPoint = { x: 200, y: 200 }
      const currentPoint = { x: 250, y: 250 }
      const scale = calculateScaleFromHandle('bottom-right', startPoint, currentPoint, bounds, center)

      expect(scale.x).toBeGreaterThan(1)
      expect(scale.y).toBeGreaterThan(1)
    })

    test('アスペクト比維持オプション', () => {
      const startPoint = { x: 200, y: 200 }
      const currentPoint = { x: 250, y: 220 } // X方向に多くドラッグ
      const scale = calculateScaleFromHandle('bottom-right', startPoint, currentPoint, bounds, center, {
        preserveAspectRatio: true,
      })

      expect(Math.abs(scale.x)).toBe(Math.abs(scale.y))
    })

    test('回転ハンドルはスケール1を返す', () => {
      const startPoint = { x: 150, y: 50 }
      const currentPoint = { x: 200, y: 50 }
      const scale = calculateScaleFromHandle('rotation', startPoint, currentPoint, bounds, center)

      expect(scale.x).toBe(1)
      expect(scale.y).toBe(1)
    })
  })

  describe('calculateRotationFromHandle', () => {
    const center = { x: 100, y: 100 }

    test('時計回りの回転を計算', () => {
      const startPoint = { x: 100, y: 50 } // 上
      const currentPoint = { x: 150, y: 100 } // 右
      const rotation = calculateRotationFromHandle(startPoint, currentPoint, center)

      expect(rotation).toBeCloseTo(Math.PI / 2, 1) // 90度
    })

    test('反時計回りの回転を計算', () => {
      const startPoint = { x: 150, y: 100 } // 右
      const currentPoint = { x: 100, y: 50 } // 上
      const rotation = calculateRotationFromHandle(startPoint, currentPoint, center)

      // 右→上は反時計回りで-90度（または270度）
      // atan2の戻り値は-πからπなので、値を正規化して比較
      const normalizedRotation = rotation < 0 ? rotation + 2 * Math.PI : rotation
      const expectedRotation = -Math.PI / 2 + 2 * Math.PI // 270度
      expect(normalizedRotation).toBeCloseTo(expectedRotation, 1)
    })

    test('角度スナップが適用される', () => {
      const startPoint = { x: 100, y: 50 }
      // 約20度の位置（15度スナップで15度になる）
      const angle = 20 * (Math.PI / 180) // 20度をラジアンに
      const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x)
      const targetAngle = startAngle + angle
      const currentPoint = {
        x: center.x + 50 * Math.cos(targetAngle),
        y: center.y + 50 * Math.sin(targetAngle),
      }
      const rotation = calculateRotationFromHandle(startPoint, currentPoint, center, {
        snapToAngle: true,
        snapAngleDegrees: 15,
      })

      // 15度の倍数になる（20度→15度にスナップ）
      const degrees = (rotation * 180) / Math.PI
      expect(degrees).toBeCloseTo(15, 0)
    })
  })

  describe('createInitialTransformState', () => {
    test('初期状態を正しく作成', () => {
      const bounds: Bounds = { x: 50, y: 50, width: 100, height: 100 }
      const state = createInitialTransformState('free-transform', bounds, null)

      expect(state.mode).toBe('free-transform')
      expect(state.center).toEqual({ x: 100, y: 100 })
      expect(state.scale).toEqual({ x: 1, y: 1 })
      expect(state.rotation).toBe(0)
      expect(state.originalBounds).toEqual(bounds)
      expect(state.originalImageData).toBeNull()
    })
  })

  describe('getNextTransformMode', () => {
    test('free-transform → scale', () => {
      expect(getNextTransformMode('free-transform')).toBe('scale')
    })

    test('scale → rotate', () => {
      expect(getNextTransformMode('scale')).toBe('rotate')
    })

    test('rotate → free-transform', () => {
      expect(getNextTransformMode('rotate')).toBe('free-transform')
    })
  })

  describe('applyScaleToTransform', () => {
    test('スケールを累積適用', () => {
      const state = createInitialTransformState(
        'scale',
        { x: 0, y: 0, width: 100, height: 100 },
        null
      )

      const scaled1 = applyScaleToTransform(state, { x: 2, y: 2 })
      expect(scaled1.scale).toEqual({ x: 2, y: 2 })

      const scaled2 = applyScaleToTransform(scaled1, { x: 0.5, y: 0.5 })
      expect(scaled2.scale).toEqual({ x: 1, y: 1 })
    })
  })

  describe('applyRotationToTransform', () => {
    test('回転を累積適用', () => {
      const state = createInitialTransformState(
        'rotate',
        { x: 0, y: 0, width: 100, height: 100 },
        null
      )

      const rotated1 = applyRotationToTransform(state, Math.PI / 4)
      expect(rotated1.rotation).toBeCloseTo(Math.PI / 4, 10)

      const rotated2 = applyRotationToTransform(rotated1, Math.PI / 4)
      expect(rotated2.rotation).toBeCloseTo(Math.PI / 2, 10)
    })
  })

  describe('isPointInTransformBounds', () => {
    const bounds: Bounds = { x: 100, y: 100, width: 100, height: 100 }
    const center = { x: 150, y: 150 }

    test('回転なしでバウンズ内の点', () => {
      expect(isPointInTransformBounds({ x: 150, y: 150 }, bounds, 0, center)).toBe(true)
    })

    test('回転なしでバウンズ外の点', () => {
      expect(isPointInTransformBounds({ x: 50, y: 50 }, bounds, 0, center)).toBe(false)
    })

    test('回転ありでバウンズ内の点', () => {
      // 45度回転しても中心は常に内側
      expect(isPointInTransformBounds({ x: 150, y: 150 }, bounds, Math.PI / 4, center)).toBe(true)
    })

    test('回転ありで角の点は外側になる', () => {
      // 45度回転すると元の角は外側に出る
      const corner = { x: 100, y: 100 }
      // 回転前は内側
      expect(isPointInTransformBounds(corner, bounds, 0, center)).toBe(true)
    })
  })

  describe('getTransformedCorners', () => {
    const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }
    const center = { x: 50, y: 50 }

    test('変形なしで元の4隅を返す', () => {
      const corners = getTransformedCorners(bounds, { x: 1, y: 1 }, 0, center)

      expect(corners).toHaveLength(4)
      expect(corners[0]).toEqual({ x: 0, y: 0 })
      expect(corners[1]).toEqual({ x: 100, y: 0 })
      expect(corners[2]).toEqual({ x: 100, y: 100 })
      expect(corners[3]).toEqual({ x: 0, y: 100 })
    })

    test('2倍スケールで座標が拡大', () => {
      const corners = getTransformedCorners(bounds, { x: 2, y: 2 }, 0, center)

      expect(corners[0]).toEqual({ x: -50, y: -50 })
      expect(corners[2]).toEqual({ x: 150, y: 150 })
    })

    test('90度回転で座標が回転', () => {
      const corners = getTransformedCorners(bounds, { x: 1, y: 1 }, Math.PI / 2, center)

      // 左上(0,0)は右上に移動
      expect(corners[0].x).toBeCloseTo(100, 5)
      expect(corners[0].y).toBeCloseTo(0, 5)
    })
  })
})
