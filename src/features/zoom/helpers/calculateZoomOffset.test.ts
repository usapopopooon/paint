import { describe, test, expect } from 'vitest'
import { calculateZoomOffset } from './calculateZoomOffset'

describe('calculateZoomOffset', () => {
  describe('ズームイン', () => {
    test('画面中央でズームインした場合、オフセットは変わらない', () => {
      const result = calculateZoomOffset(
        0, // mouseX（中央）
        0, // mouseY（中央）
        1.0, // oldZoom
        1.5, // newZoom
        { x: 0, y: 0 } // currentOffset
      )

      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    test('右下でズームインした場合、オフセットは左上に移動', () => {
      const result = calculateZoomOffset(
        100, // mouseX
        100, // mouseY
        1.0, // oldZoom
        2.0, // newZoom（2倍に拡大）
        { x: 0, y: 0 } // currentOffset
      )

      // zoomRatio = 2.0
      // x = 100 - (100 - 0) * 2 = 100 - 200 = -100
      // y = 100 - (100 - 0) * 2 = 100 - 200 = -100
      expect(result.x).toBe(-100)
      expect(result.y).toBe(-100)
    })

    test('既存のオフセットがある場合も正しく計算される', () => {
      const result = calculateZoomOffset(
        50, // mouseX
        50, // mouseY
        1.0, // oldZoom
        2.0, // newZoom
        { x: 20, y: 30 } // currentOffset
      )

      // zoomRatio = 2.0
      // x = 50 - (50 - 20) * 2 = 50 - 60 = -10
      // y = 50 - (50 - 30) * 2 = 50 - 40 = 10
      expect(result.x).toBe(-10)
      expect(result.y).toBe(10)
    })
  })

  describe('ズームアウト', () => {
    test('右下でズームアウトした場合、オフセットは右下に移動', () => {
      const result = calculateZoomOffset(
        100, // mouseX
        100, // mouseY
        2.0, // oldZoom
        1.0, // newZoom（半分に縮小）
        { x: 0, y: 0 } // currentOffset
      )

      // zoomRatio = 0.5
      // x = 100 - (100 - 0) * 0.5 = 100 - 50 = 50
      // y = 100 - (100 - 0) * 0.5 = 100 - 50 = 50
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })
  })

  describe('ズーム倍率が同じ場合', () => {
    test('オフセットは変わらない', () => {
      const currentOffset = { x: 25, y: 35 }
      const result = calculateZoomOffset(100, 100, 1.5, 1.5, currentOffset)

      // zoomRatio = 1.0
      // x = 100 - (100 - 25) * 1 = 100 - 75 = 25
      // y = 100 - (100 - 35) * 1 = 100 - 65 = 35
      expect(result.x).toBe(currentOffset.x)
      expect(result.y).toBe(currentOffset.y)
    })
  })

  describe('マウス位置が負の場合', () => {
    test('負の座標でも正しく計算される', () => {
      const result = calculateZoomOffset(
        -50, // mouseX
        -50, // mouseY
        1.0, // oldZoom
        2.0, // newZoom
        { x: 0, y: 0 } // currentOffset
      )

      // zoomRatio = 2.0
      // x = -50 - (-50 - 0) * 2 = -50 - (-100) = 50
      // y = -50 - (-50 - 0) * 2 = -50 - (-100) = 50
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })
  })
})
