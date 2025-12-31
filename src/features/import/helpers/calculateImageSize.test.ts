import { describe, test, expect } from 'vitest'
import { calculateImageSize } from './calculateImageSize'
import { DISPLAY_MULTIPLIER } from '@/constants/display'

describe('calculateImageSize', () => {
  // キャンバスサイズ（UI座標系）
  const canvasWidth = 800
  const canvasHeight = 600

  describe('画像がキャンバスより小さい場合', () => {
    test('拡大せずに中央配置される', () => {
      const imageWidth = 400
      const imageHeight = 300

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 内部座標系に変換されている
      expect(result.width).toBe(imageWidth * DISPLAY_MULTIPLIER)
      expect(result.height).toBe(imageHeight * DISPLAY_MULTIPLIER)
      // 中央配置
      expect(result.x).toBe((canvasWidth * DISPLAY_MULTIPLIER - result.width) / 2)
      expect(result.y).toBe((canvasHeight * DISPLAY_MULTIPLIER - result.height) / 2)
    })

    test('正方形画像も中央配置される', () => {
      const imageWidth = 200
      const imageHeight = 200

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      expect(result.width).toBe(imageWidth * DISPLAY_MULTIPLIER)
      expect(result.height).toBe(imageHeight * DISPLAY_MULTIPLIER)
    })
  })

  describe('画像の幅がキャンバスより大きい場合', () => {
    test('幅に合わせて縮小される', () => {
      const imageWidth = 1600
      const imageHeight = 300

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 幅がキャンバス幅に収まる
      expect(result.width).toBe(canvasWidth * DISPLAY_MULTIPLIER)
      // 縦横比維持
      const scale = canvasWidth / imageWidth
      expect(result.height).toBe(imageHeight * DISPLAY_MULTIPLIER * scale)
    })
  })

  describe('画像の高さがキャンバスより大きい場合', () => {
    test('高さに合わせて縮小される', () => {
      const imageWidth = 400
      const imageHeight = 1200

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 高さがキャンバス高さに収まる
      expect(result.height).toBe(canvasHeight * DISPLAY_MULTIPLIER)
      // 縦横比維持
      const scale = canvasHeight / imageHeight
      expect(result.width).toBe(imageWidth * DISPLAY_MULTIPLIER * scale)
    })
  })

  describe('画像の両辺がキャンバスより大きい場合', () => {
    test('より制約が厳しい方に合わせて縮小される（幅が制約）', () => {
      const imageWidth = 2400
      const imageHeight = 900

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 幅の比率が小さいので幅に合わせる
      const scaleX = canvasWidth / imageWidth
      const scaleY = canvasHeight / imageHeight
      expect(scaleX).toBeLessThan(scaleY)

      expect(result.width).toBe(canvasWidth * DISPLAY_MULTIPLIER)
      expect(result.height).toBe(imageHeight * DISPLAY_MULTIPLIER * scaleX)
    })

    test('より制約が厳しい方に合わせて縮小される（高さが制約）', () => {
      const imageWidth = 1000
      const imageHeight = 2000

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 高さの比率が小さいので高さに合わせる
      const scaleX = canvasWidth / imageWidth
      const scaleY = canvasHeight / imageHeight
      expect(scaleY).toBeLessThan(scaleX)

      expect(result.height).toBe(canvasHeight * DISPLAY_MULTIPLIER)
      expect(result.width).toBe(imageWidth * DISPLAY_MULTIPLIER * scaleY)
    })
  })

  describe('画像がキャンバスと同じサイズの場合', () => {
    test('縮小されず中央（原点）に配置される', () => {
      const result = calculateImageSize(canvasWidth, canvasHeight, canvasWidth, canvasHeight)

      expect(result.width).toBe(canvasWidth * DISPLAY_MULTIPLIER)
      expect(result.height).toBe(canvasHeight * DISPLAY_MULTIPLIER)
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })
  })

  describe('中央配置の確認', () => {
    test('x, yは常に0以上', () => {
      const testCases = [
        { imageWidth: 100, imageHeight: 100 },
        { imageWidth: 2000, imageHeight: 2000 },
        { imageWidth: 400, imageHeight: 1200 },
        { imageWidth: 1600, imageHeight: 300 },
      ]

      for (const { imageWidth, imageHeight } of testCases) {
        const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)
        expect(result.x).toBeGreaterThanOrEqual(0)
        expect(result.y).toBeGreaterThanOrEqual(0)
      }
    })
  })
})
