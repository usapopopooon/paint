import { describe, test, expect } from 'vitest'
import { mergeLayerToImage } from './mergeLayerToImage'
import type { Layer } from '../../types'
import { createSolidBrushTip } from '@/features/brush'
import { createStrokeDrawable } from '@/features/drawable'

const createTestLayer = (overrides: Partial<Layer> = {}): Layer => ({
  id: 'test-layer',
  name: 'Test Layer',
  type: 'drawing',
  isVisible: true,
  isLocked: false,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
  ...overrides,
})

const testDrawable = createStrokeDrawable(
  [
    { x: 10, y: 10 },
    { x: 50, y: 50 },
  ],
  {
    color: '#ff0000',
    brushTip: createSolidBrushTip(5),
    blendMode: 'normal',
  }
)

describe('mergeLayerToImage', () => {
  test('上レイヤーが空の場合、下レイヤーのDrawablesをそのまま返す', async () => {
    const upperLayer = createTestLayer({ id: 'upper', drawables: [] })
    const lowerLayer = createTestLayer({ id: 'lower', drawables: [testDrawable] })

    const result = await mergeLayerToImage(upperLayer, lowerLayer, 100, 100)

    expect(result).toEqual([testDrawable])
  })

  test('下レイヤーが空でnormal/100%の場合、上レイヤーのDrawablesをそのまま返す', async () => {
    const upperLayer = createTestLayer({
      id: 'upper',
      drawables: [testDrawable],
      blendMode: 'normal',
      opacity: 1,
    })
    const lowerLayer = createTestLayer({ id: 'lower', drawables: [] })

    const result = await mergeLayerToImage(upperLayer, lowerLayer, 100, 100)

    expect(result).toEqual([testDrawable])
  })

  test('normal/100%の場合、Drawablesを単純に結合する', async () => {
    const drawable1 = createStrokeDrawable(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      {
        color: '#ff0000',
        brushTip: createSolidBrushTip(5),
        blendMode: 'normal',
      }
    )
    const drawable2 = createStrokeDrawable(
      [
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ],
      {
        color: '#00ff00',
        brushTip: createSolidBrushTip(5),
        blendMode: 'normal',
      }
    )

    const upperLayer = createTestLayer({
      id: 'upper',
      drawables: [drawable2],
      blendMode: 'normal',
      opacity: 1,
    })
    const lowerLayer = createTestLayer({ id: 'lower', drawables: [drawable1] })

    const result = await mergeLayerToImage(upperLayer, lowerLayer, 100, 100)

    expect(result).toHaveLength(2)
    expect(result[0]).toBe(drawable1)
    expect(result[1]).toBe(drawable2)
  })

  // 注意: ブレンドモード/不透明度のテストはブラウザ環境でのみ動作します
  // （happy-dom環境ではcanvas.getContext('2d')がnullを返すため）
  // これらのケースはStorybookテストおよび手動テストでカバーされています
})
