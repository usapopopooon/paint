import { describe, test, expect } from 'vitest'
import { calculateZoomOffset } from './calculateZoomOffset'

describe('calculateZoomOffset', () => {
  // ビューポートサイズ（テスト用）
  const viewportWidth = 800
  const viewportHeight = 600
  const centerX = viewportWidth / 2 // 400
  const centerY = viewportHeight / 2 // 300

  describe('ビューポート中央でズーム', () => {
    test('中央でズームインした場合、オフセットは変わらない', () => {
      const result = calculateZoomOffset(
        centerX, // mouseX = 400（中央）
        centerY, // mouseY = 300（中央）
        viewportWidth,
        viewportHeight,
        1.0, // oldZoom
        2.0, // newZoom
        { x: 0, y: 0 } // currentOffset
      )

      // 中央でズームするとオフセットは変わらない
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    test('オフセットがある状態で中央でズームインしても、オフセットは変わらない', () => {
      const result = calculateZoomOffset(
        centerX,
        centerY,
        viewportWidth,
        viewportHeight,
        1.0,
        2.0,
        { x: 50, y: -30 }
      )

      expect(result.x).toBe(50)
      expect(result.y).toBe(-30)
    })
  })

  describe('ビューポート右下でズーム', () => {
    test('右下でズームインすると、キャンバスが左上に移動', () => {
      // マウスが中央より右100px、下100pxの位置
      const mouseX = centerX + 100 // 500
      const mouseY = centerY + 100 // 400

      const result = calculateZoomOffset(mouseX, mouseY, viewportWidth, viewportHeight, 1.0, 2.0, {
        x: 0,
        y: 0,
      })

      // 計算：
      // mouseOffsetFromCenter = (100, 100)
      // canvasPoint at oldZoom=1: (100/1 - 0, 100/1 - 0) = (100, 100)
      // newOffset: (100/2 - 100, 100/2 - 100) = (50 - 100, 50 - 100) = (-50, -50)
      expect(result.x).toBe(-50)
      expect(result.y).toBe(-50)
    })

    test('右下でズームアウトすると、キャンバスが右下に移動', () => {
      const mouseX = centerX + 100
      const mouseY = centerY + 100

      const result = calculateZoomOffset(mouseX, mouseY, viewportWidth, viewportHeight, 2.0, 1.0, {
        x: 0,
        y: 0,
      })

      // mouseOffsetFromCenter = (100, 100)
      // canvasPoint at oldZoom=2: (100/2 - 0, 100/2 - 0) = (50, 50)
      // newOffset: (100/1 - 50, 100/1 - 50) = (100 - 50, 100 - 50) = (50, 50)
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })
  })

  describe('ビューポート左上でズーム', () => {
    test('左上でズームインすると、キャンバスが右下に移動', () => {
      // マウスが中央より左100px、上100pxの位置
      const mouseX = centerX - 100 // 300
      const mouseY = centerY - 100 // 200

      const result = calculateZoomOffset(mouseX, mouseY, viewportWidth, viewportHeight, 1.0, 2.0, {
        x: 0,
        y: 0,
      })

      // mouseOffsetFromCenter = (-100, -100)
      // canvasPoint at oldZoom=1: (-100/1 - 0, -100/1 - 0) = (-100, -100)
      // newOffset: (-100/2 - (-100), -100/2 - (-100)) = (-50 + 100, -50 + 100) = (50, 50)
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })
  })

  describe('既存のオフセットがある場合', () => {
    test('オフセット状態から右下でズームイン', () => {
      const mouseX = centerX + 100
      const mouseY = centerY + 100

      const result = calculateZoomOffset(mouseX, mouseY, viewportWidth, viewportHeight, 1.0, 2.0, {
        x: 20,
        y: -10,
      })

      // mouseOffsetFromCenter = (100, 100)
      // canvasPoint at oldZoom=1: (100/1 - 20, 100/1 - (-10)) = (80, 110)
      // newOffset: (100/2 - 80, 100/2 - 110) = (50 - 80, 50 - 110) = (-30, -60)
      expect(result.x).toBe(-30)
      expect(result.y).toBe(-60)
    })
  })

  describe('ズーム倍率が同じ場合', () => {
    test('オフセットは変わらない', () => {
      const currentOffset = { x: 25, y: 35 }
      const result = calculateZoomOffset(
        500,
        400,
        viewportWidth,
        viewportHeight,
        1.5,
        1.5,
        currentOffset
      )

      expect(result.x).toBe(currentOffset.x)
      expect(result.y).toBe(currentOffset.y)
    })
  })

  describe('連続ズーム', () => {
    test('同じ位置で連続ズームインしてもカーソル位置は固定される', () => {
      const mouseX = centerX + 100
      const mouseY = centerY + 50

      // 1回目のズーム
      const offset1 = calculateZoomOffset(mouseX, mouseY, viewportWidth, viewportHeight, 1.0, 1.5, {
        x: 0,
        y: 0,
      })

      // 2回目のズーム（1回目の結果を使用）
      const offset2 = calculateZoomOffset(
        mouseX,
        mouseY,
        viewportWidth,
        viewportHeight,
        1.5,
        2.0,
        offset1
      )

      // 両方のズーム後、同じキャンバス位置を指している
      // mouseOffsetFromCenter = (100, 50)
      // 最初のキャンバス位置: (100, 50)
      // 最終的なズーム2.0で同じ点を指すオフセット: (100/2 - 100, 50/2 - 50) = (-50, -25)
      expect(offset2.x).toBe(-50)
      expect(offset2.y).toBe(-25)
    })
  })

  describe('小数点のズーム倍率', () => {
    test('小数点のズーム倍率でも正確に計算される', () => {
      const mouseX = centerX + 200
      const mouseY = centerY - 100

      const result = calculateZoomOffset(
        mouseX,
        mouseY,
        viewportWidth,
        viewportHeight,
        0.5, // 50%
        0.75, // 75%
        { x: 10, y: -5 }
      )

      // mouseOffsetFromCenter = (200, -100)
      // canvasPoint at 0.5: (200/0.5 - 10, -100/0.5 - (-5)) = (390, -195)
      // newOffset at 0.75: (200/0.75 - 390, -100/0.75 - (-195))
      //                  = (266.666... - 390, -133.333... + 195)
      //                  = (-123.333..., 61.666...)
      expect(result.x).toBeCloseTo(-123.333, 2)
      expect(result.y).toBeCloseTo(61.666, 2)
    })
  })
})
