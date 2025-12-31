import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useLayers } from './useLayers'
import { createStrokeDrawable } from '@/features/drawable'
import type { StrokeDrawable } from '@/features/drawable'
import { createSolidBrushTip } from '@/features/brush'
import { LocaleProvider } from '@/features/i18n/hooks/LocaleProvider'

// Mock storage
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <LocaleProvider defaultLocale="ja">{children}</LocaleProvider>
)

const createTestStroke = (points: { x: number; y: number }[]) =>
  createStrokeDrawable(points, {
    color: '#000000',
    brushTip: createSolidBrushTip(3),
    blendMode: 'normal',
  })

describe('useLayers', () => {
  describe('translateAllLayers', () => {
    test('全レイヤーのDrawableの座標をオフセット分移動する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      // Drawableを追加
      act(() => {
        result.current.addDrawable(
          createTestStroke([
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ])
        )
      })

      // 座標を移動
      act(() => {
        result.current.translateAllLayers(50, 25)
      })

      const drawables = result.current.activeLayer.drawables as StrokeDrawable[]
      expect(drawables[0]?.points).toEqual([
        { x: 150, y: 125 },
        { x: 250, y: 225 },
      ])
    })

    test('負のオフセットで座標を移動する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      act(() => {
        result.current.addDrawable(
          createTestStroke([
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ])
        )
      })

      act(() => {
        result.current.translateAllLayers(-30, -20)
      })

      const drawables = result.current.activeLayer.drawables as StrokeDrawable[]
      expect(drawables[0]?.points).toEqual([
        { x: 70, y: 80 },
        { x: 170, y: 180 },
      ])
    })

    test('オフセット0の場合は何も変更しない', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      act(() => {
        result.current.addDrawable(
          createTestStroke([
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ])
        )
      })

      const drawablesBefore = result.current.activeLayer.drawables

      act(() => {
        result.current.translateAllLayers(0, 0)
      })

      // 同じ参照のまま（stateが更新されていない）
      expect(result.current.activeLayer.drawables).toBe(drawablesBefore)
    })

    test('複数のDrawableを移動する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      act(() => {
        result.current.addDrawable(createTestStroke([{ x: 100, y: 100 }]))
        result.current.addDrawable(createTestStroke([{ x: 200, y: 200 }]))
      })

      act(() => {
        result.current.translateAllLayers(10, 20)
      })

      const drawables = result.current.activeLayer.drawables as StrokeDrawable[]
      expect(drawables[0]?.points).toEqual([{ x: 110, y: 120 }])
      expect(drawables[1]?.points).toEqual([{ x: 210, y: 220 }])
    })

    test('Drawableがない場合でもエラーにならない', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      expect(() => {
        act(() => {
          result.current.translateAllLayers(10, 20)
        })
      }).not.toThrow()

      expect(result.current.activeLayer.drawables).toEqual([])
    })
  })

  describe('addLayer', () => {
    test('新しいレイヤーを追加する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      const initialLayerCount = result.current.drawingLayerCount

      let addedLayer: { layerId: string; name: string; index: number } | undefined
      act(() => {
        addedLayer = result.current.addLayer()
      })

      expect(result.current.drawingLayerCount).toBe(initialLayerCount + 1)
      expect(addedLayer?.name).toBe('レイヤー2')
    })

    test('追加したレイヤーが自動的にアクティブになる', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      let addedLayer: { layerId: string; name: string; index: number } | undefined
      act(() => {
        addedLayer = result.current.addLayer()
      })

      expect(result.current.activeLayerId).toBe(addedLayer?.layerId)
    })

    test('レイヤー番号は削除されても増え続ける', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      let layer2: { layerId: string; name: string; index: number } | undefined
      let layer3: { layerId: string; name: string; index: number } | undefined

      act(() => {
        layer2 = result.current.addLayer()
      })

      act(() => {
        result.current.deleteLayer(layer2!.layerId)
      })

      act(() => {
        layer3 = result.current.addLayer()
      })

      expect(layer3?.name).toBe('レイヤー3')
    })
  })

  describe('deleteLayer', () => {
    test('レイヤーを削除する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      let addedLayer: { layerId: string; name: string; index: number } | undefined
      act(() => {
        addedLayer = result.current.addLayer()
      })

      const layerCountBefore = result.current.drawingLayerCount

      act(() => {
        result.current.deleteLayer(addedLayer!.layerId)
      })

      expect(result.current.drawingLayerCount).toBe(layerCountBefore - 1)
    })

    test('最後の1枚は削除できない', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      // 初期状態は1枚のレイヤー
      expect(result.current.drawingLayerCount).toBe(1)

      const initialLayerId = result.current.activeLayerId
      let deleteResult: { layer: unknown; index: number } | null = null

      act(() => {
        deleteResult = result.current.deleteLayer(initialLayerId)
      })

      expect(deleteResult).toBeNull()
      expect(result.current.drawingLayerCount).toBe(1)
    })

    test('削除されたレイヤーがアクティブだった場合、別のレイヤーがアクティブになる', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      const initialLayerId = result.current.activeLayerId

      let addedLayer: { layerId: string; name: string; index: number } | undefined
      act(() => {
        addedLayer = result.current.addLayer()
      })

      // 追加したレイヤーがアクティブ
      expect(result.current.activeLayerId).toBe(addedLayer?.layerId)

      act(() => {
        result.current.deleteLayer(addedLayer!.layerId)
      })

      // 元のレイヤーがアクティブになる
      expect(result.current.activeLayerId).toBe(initialLayerId)
    })
  })

  describe('restoreLayer', () => {
    test('削除されたレイヤーを復元する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      // 初期状態は1枚
      expect(result.current.drawingLayerCount).toBe(1)

      // レイヤーを追加
      act(() => {
        result.current.addLayer()
      })

      // 2枚になった
      expect(result.current.drawingLayerCount).toBe(2)

      // 追加したレイヤー（アクティブなレイヤー）を取得して削除
      const layerToDelete = result.current.activeLayer
      let deletedResult: { layer: unknown; index: number } | null = null
      act(() => {
        deletedResult = result.current.deleteLayer(layerToDelete.id)
      })

      // 削除成功を確認
      expect(deletedResult).not.toBeNull()
      expect(result.current.drawingLayerCount).toBe(1)

      act(() => {
        result.current.restoreLayer(
          deletedResult!.layer as Parameters<typeof result.current.restoreLayer>[0],
          deletedResult!.index
        )
      })

      expect(result.current.drawingLayerCount).toBe(2)
    })

    test('復元されたレイヤーがアクティブになる', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      // 初期状態は1枚
      expect(result.current.drawingLayerCount).toBe(1)

      // レイヤーを追加
      act(() => {
        result.current.addLayer()
      })

      // 追加したレイヤー（アクティブなレイヤー）を取得して削除
      const addedLayerId = result.current.activeLayerId
      let deletedResult: { layer: unknown; index: number } | null = null
      act(() => {
        deletedResult = result.current.deleteLayer(addedLayerId)
      })

      // 削除成功を確認
      expect(deletedResult).not.toBeNull()

      act(() => {
        result.current.restoreLayer(
          deletedResult!.layer as Parameters<typeof result.current.restoreLayer>[0],
          deletedResult!.index
        )
      })

      expect(result.current.activeLayerId).toBe(addedLayerId)
    })
  })

  describe('getLayerById', () => {
    test('IDでレイヤーを取得する', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      const layer = result.current.getLayerById(result.current.activeLayerId)

      expect(layer).toBeDefined()
      expect(layer?.id).toBe(result.current.activeLayerId)
    })

    test('存在しないIDの場合はundefinedを返す', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      const layer = result.current.getLayerById('non-existent-id')

      expect(layer).toBeUndefined()
    })
  })

  describe('drawingLayerCount', () => {
    test('背景レイヤーを除いた描画レイヤーの数を返す', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      // 初期状態は1枚の描画レイヤー
      expect(result.current.drawingLayerCount).toBe(1)

      act(() => {
        result.current.addLayer()
      })

      expect(result.current.drawingLayerCount).toBe(2)

      act(() => {
        result.current.addLayer()
      })

      expect(result.current.drawingLayerCount).toBe(3)
    })
  })

  describe('setLayerName', () => {
    test('レイヤー名を変更できる', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      const initialLayerId = result.current.activeLayerId

      act(() => {
        result.current.setLayerName(initialLayerId, 'New Name')
      })

      const updatedLayer = result.current.getLayerById(initialLayerId)
      expect(updatedLayer?.name).toBe('New Name')
    })

    test('存在しないレイヤーIDでもエラーにならない', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      expect(() => {
        act(() => {
          result.current.setLayerName('non-existent-id', 'New Name')
        })
      }).not.toThrow()
    })

    test('長い名前も設定できる', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })
      const layerId = result.current.activeLayerId
      const longName = 'This is a very long layer name that exceeds typical length limits'

      act(() => {
        result.current.setLayerName(layerId, longName)
      })

      const layer = result.current.getLayerById(layerId)
      expect(layer?.name).toBe(longName)
    })

    test('複数のレイヤーがある場合、指定したレイヤーのみ名前が変更される', () => {
      const { result } = renderHook(() => useLayers(), { wrapper })

      const initialLayerId = result.current.activeLayerId

      // レイヤーを追加
      let newLayerId: string
      act(() => {
        const { layerId } = result.current.addLayer()
        newLayerId = layerId
      })

      // 元のレイヤーの名前を変更
      act(() => {
        result.current.setLayerName(initialLayerId, 'Changed Name')
      })

      // 変更したレイヤーの名前が変わっている
      const changedLayer = result.current.getLayerById(initialLayerId)
      expect(changedLayer?.name).toBe('Changed Name')

      // 新しいレイヤーの名前は変わっていない
      const newLayer = result.current.getLayerById(newLayerId!)
      expect(newLayer?.name).not.toBe('Changed Name')
    })
  })
})
