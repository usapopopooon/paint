import { describe, test, expect } from 'vitest'
import { calculateImageSize } from './calculateImageSize'
import { DISPLAY_MULTIPLIER } from '@/constants/display'

describe('calculateImageSize', () => {
  // キャンバスサイズ（UI座標系）
  const canvasWidth = 800
  const canvasHeight = 600
  // 内部キャンバスサイズ
  const internalCanvasWidth = canvasWidth * DISPLAY_MULTIPLIER
  const internalCanvasHeight = canvasHeight * DISPLAY_MULTIPLIER

  describe('画像がキャンバスより小さい場合', () => {
    test('拡大せずに中央配置される', () => {
      // 画像サイズはピクセル（内部座標系と同じ）
      const imageWidth = 400
      const imageHeight = 300

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 画像サイズはそのまま（拡大しない）
      expect(result.width).toBe(imageWidth)
      expect(result.height).toBe(imageHeight)
      // 中央配置
      expect(result.x).toBe((internalCanvasWidth - result.width) / 2)
      expect(result.y).toBe((internalCanvasHeight - result.height) / 2)
    })

    test('正方形画像も中央配置される', () => {
      const imageWidth = 200
      const imageHeight = 200

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      expect(result.width).toBe(imageWidth)
      expect(result.height).toBe(imageHeight)
    })
  })

  describe('画像の幅がキャンバスより大きい場合', () => {
    test('幅に合わせて縮小される', () => {
      // 画像が内部キャンバス幅より大きい
      const imageWidth = 3200 // internalCanvasWidth(1600)の2倍
      const imageHeight = 300

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 幅が内部キャンバス幅に収まる
      expect(result.width).toBe(internalCanvasWidth)
      // 縦横比維持
      const scale = internalCanvasWidth / imageWidth
      expect(result.height).toBe(imageHeight * scale)
    })
  })

  describe('画像の高さがキャンバスより大きい場合', () => {
    test('高さに合わせて縮小される', () => {
      const imageWidth = 400
      const imageHeight = 2400 // internalCanvasHeight(1200)の2倍

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 高さが内部キャンバス高さに収まる
      expect(result.height).toBe(internalCanvasHeight)
      // 縦横比維持
      const scale = internalCanvasHeight / imageHeight
      expect(result.width).toBe(imageWidth * scale)
    })
  })

  describe('画像の両辺がキャンバスより大きい場合', () => {
    test('より制約が厳しい方に合わせて縮小される（幅が制約）', () => {
      const imageWidth = 4800 // 幅のスケールがより小さい
      const imageHeight = 1800

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 幅の比率が小さいので幅に合わせる
      const scaleX = internalCanvasWidth / imageWidth
      const scaleY = internalCanvasHeight / imageHeight
      expect(scaleX).toBeLessThan(scaleY)

      expect(result.width).toBe(internalCanvasWidth)
      expect(result.height).toBe(imageHeight * scaleX)
    })

    test('より制約が厳しい方に合わせて縮小される（高さが制約）', () => {
      const imageWidth = 2000
      const imageHeight = 4000 // 高さのスケールがより小さい

      const result = calculateImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight)

      // 高さの比率が小さいので高さに合わせる
      const scaleX = internalCanvasWidth / imageWidth
      const scaleY = internalCanvasHeight / imageHeight
      expect(scaleY).toBeLessThan(scaleX)

      expect(result.height).toBe(internalCanvasHeight)
      expect(result.width).toBe(imageWidth * scaleY)
    })
  })

  describe('画像がキャンバスと同じサイズの場合', () => {
    test('縮小されず中央（原点）に配置される', () => {
      // 画像が内部キャンバスと同じサイズ
      const result = calculateImageSize(
        internalCanvasWidth,
        internalCanvasHeight,
        canvasWidth,
        canvasHeight
      )

      expect(result.width).toBe(internalCanvasWidth)
      expect(result.height).toBe(internalCanvasHeight)
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
