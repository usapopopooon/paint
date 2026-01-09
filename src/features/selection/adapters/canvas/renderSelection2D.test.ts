import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderSelection2D } from './renderSelection2D'
import type { SelectionRegion } from '../../types'

/**
 * renderSelection2D のテスト
 */
describe('renderSelection2D', () => {
  let mockCtx: CanvasRenderingContext2D
  let mockTempCtx: CanvasRenderingContext2D

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      drawImage: vi.fn(),
      strokeStyle: '',
      lineWidth: 1,
      lineDashOffset: 0,
      imageSmoothingEnabled: true,
    } as unknown as CanvasRenderingContext2D

    mockTempCtx = {
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    // document.createElement をモック
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(mockTempCtx),
        } as unknown as HTMLCanvasElement
      }
      return document.createElement(tagName)
    })
  })

  describe('矩形選択の描画', () => {
    test('矩形選択のマーチングアンツを描画する', () => {
      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10, y: 20, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: null,
        offset: { x: 0, y: 0 },
      }

      renderSelection2D(mockCtx, region)

      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.rect).toHaveBeenCalledWith(10, 20, 100, 50)
      expect(mockCtx.stroke).toHaveBeenCalledTimes(2) // 白い実線 + 黒い破線
      expect(mockCtx.restore).toHaveBeenCalled()
    })

    test('オフセット付きの矩形選択を描画する', () => {
      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10, y: 20, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: null,
        offset: { x: 5, y: 10 },
      }

      renderSelection2D(mockCtx, region)

      expect(mockCtx.rect).toHaveBeenCalledWith(15, 30, 100, 50)
    })
  })

  describe('Lasso選択の描画', () => {
    test('Lasso選択のマーチングアンツを描画する', () => {
      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'lasso',
          points: [
            { x: 10, y: 20 },
            { x: 110, y: 20 },
            { x: 110, y: 70 },
            { x: 10, y: 70 },
          ],
        },
        layerId: 'layer-1',
        imageData: null,
        offset: { x: 0, y: 0 },
      }

      renderSelection2D(mockCtx, region)

      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.moveTo).toHaveBeenCalledWith(10, 20)
      expect(mockCtx.lineTo).toHaveBeenCalledWith(110, 20)
      expect(mockCtx.lineTo).toHaveBeenCalledWith(110, 70)
      expect(mockCtx.lineTo).toHaveBeenCalledWith(10, 70)
      expect(mockCtx.closePath).toHaveBeenCalled()
      expect(mockCtx.stroke).toHaveBeenCalledTimes(2)
      expect(mockCtx.restore).toHaveBeenCalled()
    })

    test('オフセット付きのLasso選択を描画する', () => {
      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'lasso',
          points: [
            { x: 10, y: 20 },
            { x: 110, y: 20 },
          ],
        },
        layerId: 'layer-1',
        imageData: null,
        offset: { x: 5, y: 10 },
      }

      renderSelection2D(mockCtx, region)

      expect(mockCtx.moveTo).toHaveBeenCalledWith(15, 30)
      expect(mockCtx.lineTo).toHaveBeenCalledWith(115, 30)
    })
  })

  describe('ImageDataの描画', () => {
    test('ImageDataがある場合はcanvasに描画する', () => {
      const mockImageData = {
        width: 100,
        height: 50,
        data: new Uint8ClampedArray(100 * 50 * 4),
      } as ImageData

      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10, y: 20, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: mockImageData,
        offset: { x: 0, y: 0 },
      }

      renderSelection2D(mockCtx, region)

      // 一時canvasにImageDataを描画
      expect(mockTempCtx.putImageData).toHaveBeenCalledWith(mockImageData, 0, 0)
      // imageSmoothingEnabledをfalseに設定
      expect(mockCtx.imageSmoothingEnabled).toBe(false)
      // drawImageで描画
      expect(mockCtx.drawImage).toHaveBeenCalled()
    })

    test('ImageDataがnullの場合はcanvasに描画しない', () => {
      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10, y: 20, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: null,
        offset: { x: 0, y: 0 },
      }

      renderSelection2D(mockCtx, region)

      expect(mockCtx.drawImage).not.toHaveBeenCalled()
    })

    test('ImageData描画時にオフセットを適用する', () => {
      const mockImageData = {
        width: 100,
        height: 50,
        data: new Uint8ClampedArray(100 * 50 * 4),
      } as ImageData

      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10, y: 20, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: mockImageData,
        offset: { x: 5, y: 10 },
      }

      renderSelection2D(mockCtx, region)

      // bounds(10,20) + offset(5,10) = (15, 30)
      expect(mockCtx.drawImage).toHaveBeenCalledWith(expect.anything(), 15, 30)
    })

    test('ImageData描画時に座標を整数に丸める', () => {
      const mockImageData = {
        width: 100,
        height: 50,
        data: new Uint8ClampedArray(100 * 50 * 4),
      } as ImageData

      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10.3, y: 20.7, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: mockImageData,
        offset: { x: 0.5, y: 0.3 },
      }

      renderSelection2D(mockCtx, region)

      // drawImageの座標がMath.roundで整数に丸められていることを確認
      const drawImageCall = (mockCtx.drawImage as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(Number.isInteger(drawImageCall[1])).toBe(true)
      expect(Number.isInteger(drawImageCall[2])).toBe(true)
    })
  })

  describe('スタイル設定', () => {
    test('カスタムdashOffsetを適用する', () => {
      const region: SelectionRegion = {
        id: 'test-selection',
        shape: {
          type: 'rectangle',
          bounds: { x: 10, y: 20, width: 100, height: 50 },
        },
        layerId: 'layer-1',
        imageData: null,
        offset: { x: 0, y: 0 },
      }

      renderSelection2D(mockCtx, region, { dashOffset: 5 })

      expect(mockCtx.lineDashOffset).toBe(5)
    })
  })
})
