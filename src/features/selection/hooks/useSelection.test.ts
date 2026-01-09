import { describe, test, expect, beforeAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './useSelection'
import type { LayerId } from '@/features/layer'

// ImageData polyfill for test environment
beforeAll(() => {
  if (typeof ImageData === 'undefined') {
    // @ts-expect-error - polyfill for test environment
    global.ImageData = class ImageData {
      width: number
      height: number
      data: Uint8ClampedArray
      constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.data = new Uint8ClampedArray(width * height * 4)
      }
    }
  }
})

describe('useSelection', () => {
  const mockLayerId = 'layer-1' as LayerId

  describe('初期状態', () => {
    test('初期状態はidleフェーズでregionがnull', () => {
      const { result } = renderHook(() => useSelection())

      expect(result.current.state.phase).toBe('idle')
      expect(result.current.state.region).toBeNull()
      expect(result.current.state.clipboard).toBeNull()
      expect(result.current.selectionPoints).toEqual([])
    })

    test('初期ツールタイプを指定できる', () => {
      const { result } = renderHook(() => useSelection('select-lasso'))

      expect(result.current.state.toolConfig.type).toBe('select-lasso')
    })

    test('デフォルトのツールタイプはselect-rectangle', () => {
      const { result } = renderHook(() => useSelection())

      expect(result.current.state.toolConfig.type).toBe('select-rectangle')
    })
  })

  describe('矩形選択', () => {
    test('startSelectionで選択を開始', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })

      expect(result.current.state.phase).toBe('selecting')
      expect(result.current.selectionPoints).toEqual([{ x: 10, y: 20 }])
    })

    test('updateSelectionで選択範囲を更新', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })

      expect(result.current.selectionPoints).toEqual([
        { x: 10, y: 20 },
        { x: 100, y: 120 },
      ])
    })

    test('commitSelectionで選択を確定', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      expect(result.current.state.phase).toBe('selected')
      expect(result.current.state.region).not.toBeNull()
      expect(result.current.state.region?.shape.type).toBe('rectangle')

      if (result.current.state.region?.shape.type === 'rectangle') {
        expect(result.current.state.region.shape.bounds).toEqual({
          x: 10,
          y: 20,
          width: 90,
          height: 100,
        })
      }
    })

    test('小さすぎる選択は確定されない', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 10, y: 20 }) // 同じ点
      })
      act(() => {
        result.current.commitSelection()
      })

      expect(result.current.state.phase).toBe('idle')
      expect(result.current.state.region).toBeNull()
    })

    test('逆方向にドラッグしても正しいboundsが計算される', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 100, y: 120 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 10, y: 20 })
      })
      act(() => {
        result.current.commitSelection()
      })

      if (result.current.state.region?.shape.type === 'rectangle') {
        expect(result.current.state.region.shape.bounds).toEqual({
          x: 10,
          y: 20,
          width: 90,
          height: 100,
        })
      }
    })
  })

  describe('Lasso選択', () => {
    test('Lassoモードでポイントが追加される', () => {
      const { result } = renderHook(() => useSelection('select-lasso'))

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 50, y: 30 })
      })
      act(() => {
        result.current.updateSelection({ x: 30, y: 60 })
      })

      expect(result.current.selectionPoints).toEqual([
        { x: 10, y: 20 },
        { x: 50, y: 30 },
        { x: 30, y: 60 },
      ])
    })

    test('3ポイント以上でLasso選択が確定する', () => {
      const { result } = renderHook(() => useSelection('select-lasso'))

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 50, y: 30 })
      })
      act(() => {
        result.current.updateSelection({ x: 30, y: 60 })
      })
      act(() => {
        result.current.commitSelection()
      })

      expect(result.current.state.phase).toBe('selected')
      expect(result.current.state.region?.shape.type).toBe('lasso')

      if (result.current.state.region?.shape.type === 'lasso') {
        expect(result.current.state.region.shape.points).toHaveLength(3)
      }
    })

    test('3ポイント未満ではLasso選択が確定しない', () => {
      const { result } = renderHook(() => useSelection('select-lasso'))

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 50, y: 30 })
      })
      act(() => {
        result.current.commitSelection()
      })

      expect(result.current.state.phase).toBe('idle')
      expect(result.current.state.region).toBeNull()
    })
  })

  describe('deselect', () => {
    test('選択を解除する', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })
      act(() => {
        result.current.deselect()
      })

      expect(result.current.state.phase).toBe('idle')
      expect(result.current.state.region).toBeNull()
      expect(result.current.selectionPoints).toEqual([])
    })
  })

  describe('selectAll', () => {
    test('全領域を選択する', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.selectAll({ x: 0, y: 0, width: 800, height: 600 }, mockLayerId)
      })

      expect(result.current.state.phase).toBe('selected')
      expect(result.current.state.region?.shape.type).toBe('rectangle')

      if (result.current.state.region?.shape.type === 'rectangle') {
        expect(result.current.state.region.shape.bounds).toEqual({
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        })
      }
    })
  })

  describe('移動', () => {
    test('startMoveで移動を開始', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })

      expect(result.current.state.phase).toBe('moving')
    })

    test('updateMoveでオフセットが更新される', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 80, y: 100 })
      })

      expect(result.current.state.region?.offset).toEqual({ x: 30, y: 30 })
    })

    test('commitMoveでselectedフェーズに戻る', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 80, y: 100 })
      })
      act(() => {
        result.current.commitMove()
      })

      expect(result.current.state.phase).toBe('selected')
    })

    test('commitMoveでshapeの座標がoffset分移動しoffsetがリセットされる', () => {
      const { result } = renderHook(() => useSelection())

      // 矩形選択を作成（10,20 から 100,120）
      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      // 選択領域を30,30移動
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 80, y: 100 }) // dx=30, dy=30
      })
      act(() => {
        result.current.commitMove()
      })

      // shapeの座標が移動後の位置になっている
      expect(result.current.state.region?.shape.type).toBe('rectangle')
      if (result.current.state.region?.shape.type === 'rectangle') {
        expect(result.current.state.region.shape.bounds).toEqual({
          x: 40, // 10 + 30
          y: 50, // 20 + 30
          width: 90,
          height: 100,
        })
      }

      // offsetはリセットされている
      expect(result.current.state.region?.offset).toEqual({ x: 0, y: 0 })
    })

    test('2回目の移動も正しく動作する', () => {
      const { result } = renderHook(() => useSelection())

      // 矩形選択を作成
      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      // 1回目の移動（30,30移動）
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 80, y: 100 })
      })
      act(() => {
        result.current.commitMove()
      })

      // 2回目の移動（20,10移動）
      act(() => {
        result.current.startMove({ x: 60, y: 80 })
      })
      act(() => {
        result.current.updateMove({ x: 80, y: 90 }) // dx=20, dy=10
      })
      act(() => {
        result.current.commitMove()
      })

      // shapeの座標が累積移動後の位置になっている
      if (result.current.state.region?.shape.type === 'rectangle') {
        expect(result.current.state.region.shape.bounds).toEqual({
          x: 60, // 10 + 30 + 20
          y: 60, // 20 + 30 + 10
          width: 90,
          height: 100,
        })
      }

      expect(result.current.state.region?.offset).toEqual({ x: 0, y: 0 })
    })

    test('offsetが0の場合はshapeを更新しない', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      // 移動せずにcommit
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.commitMove()
      })

      // shapeの座標は変わらない
      if (result.current.state.region?.shape.type === 'rectangle') {
        expect(result.current.state.region.shape.bounds).toEqual({
          x: 10,
          y: 20,
          width: 90,
          height: 100,
        })
      }
    })
  })

  describe('deleteSelection', () => {
    test('選択領域を削除して返す', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      let deletedRegion: ReturnType<typeof result.current.deleteSelection> = null
      act(() => {
        deletedRegion = result.current.deleteSelection()
      })

      expect(deletedRegion).not.toBeNull()
      expect(result.current.state.phase).toBe('idle')
      expect(result.current.state.region).toBeNull()
    })

    test('選択がない場合はnullを返す', () => {
      const { result } = renderHook(() => useSelection())

      let deletedRegion: ReturnType<typeof result.current.deleteSelection> = null
      act(() => {
        deletedRegion = result.current.deleteSelection()
      })

      expect(deletedRegion).toBeNull()
    })
  })

  describe('クリップボード操作', () => {
    test('copySelectionでクリップボードに保存', () => {
      const { result } = renderHook(() => useSelection())
      const mockImageData = new ImageData(10, 10)
      const bounds = { x: 10, y: 20, width: 10, height: 10 }

      act(() => {
        result.current.copySelection(mockImageData, bounds)
      })

      expect(result.current.state.clipboard).not.toBeNull()
      expect(result.current.state.clipboard?.bounds).toEqual(bounds)
    })

    test('cutSelectionでクリップボードに保存し選択を解除', () => {
      const { result } = renderHook(() => useSelection())
      const mockImageData = new ImageData(10, 10)
      const bounds = { x: 10, y: 20, width: 10, height: 10 }

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      let cutRegion: ReturnType<typeof result.current.cutSelection> = null
      act(() => {
        cutRegion = result.current.cutSelection(mockImageData, bounds)
      })

      expect(cutRegion).not.toBeNull()
      expect(result.current.state.clipboard).not.toBeNull()
      expect(result.current.state.phase).toBe('idle')
      expect(result.current.state.region).toBeNull()
    })

    test('pasteSelectionでキャンバス中央にペースト', () => {
      const { result } = renderHook(() => useSelection())
      const mockImageData = new ImageData(100, 100)
      const bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.copySelection(mockImageData, bounds)
      })

      let pastedClipboard: ReturnType<typeof result.current.pasteSelection> = null
      act(() => {
        pastedClipboard = result.current.pasteSelection(mockLayerId, {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        })
      })

      expect(pastedClipboard).not.toBeNull()
      expect(result.current.state.phase).toBe('selected')
      expect(result.current.state.region).not.toBeNull()

      if (result.current.state.region?.shape.type === 'rectangle') {
        // 中央に配置される: (800-100)/2 = 350, (600-100)/2 = 250
        expect(result.current.state.region.shape.bounds.x).toBe(350)
        expect(result.current.state.region.shape.bounds.y).toBe(250)
      }
    })

    test('クリップボードが空の場合pasteSelectionはnullを返す', () => {
      const { result } = renderHook(() => useSelection())

      let pastedClipboard: ReturnType<typeof result.current.pasteSelection> = null
      act(() => {
        pastedClipboard = result.current.pasteSelection(mockLayerId, {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        })
      })

      expect(pastedClipboard).toBeNull()
    })
  })

  describe('fillSelection', () => {
    test('選択領域がある場合は形状と色を返す', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      type FillResult = { shape: { type: string }; color: string } | null
      let fillResult: FillResult = null as FillResult
      act(() => {
        fillResult = result.current.fillSelection('#ff0000')
      })

      expect(fillResult).not.toBeNull()
      expect(fillResult?.color).toBe('#ff0000')
      expect(fillResult?.shape.type).toBe('rectangle')
    })

    test('選択領域がない場合はnullを返す', () => {
      const { result } = renderHook(() => useSelection())

      type FillResult = { shape: { type: string }; color: string } | null
      let fillResult: FillResult = null as FillResult
      act(() => {
        fillResult = result.current.fillSelection('#ff0000')
      })

      expect(fillResult).toBeNull()
    })
  })

  describe('setToolType', () => {
    test('ツールタイプを変更できる', () => {
      const { result } = renderHook(() => useSelection())

      expect(result.current.state.toolConfig.type).toBe('select-rectangle')

      act(() => {
        result.current.setToolType('select-lasso')
      })

      expect(result.current.state.toolConfig.type).toBe('select-lasso')
    })
  })

  describe('isPointInRegion', () => {
    test('矩形選択内の点はtrueを返す', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      expect(result.current.isPointInRegion({ x: 50, y: 70 })).toBe(true)
    })

    test('矩形選択外の点はfalseを返す', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      expect(result.current.isPointInRegion({ x: 5, y: 10 })).toBe(false)
      expect(result.current.isPointInRegion({ x: 150, y: 150 })).toBe(false)
    })

    test('選択がない場合はfalseを返す', () => {
      const { result } = renderHook(() => useSelection())

      expect(result.current.isPointInRegion({ x: 50, y: 70 })).toBe(false)
    })

    test('オフセットを考慮して判定する', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 100, y: 120 }) // offset: { x: 50, y: 50 }
      })

      // 元のboundsは { x: 10, y: 20, width: 90, height: 100 }
      // offset後は { x: 60, y: 70 } から { x: 150, y: 170 } の範囲
      expect(result.current.isPointInRegion({ x: 100, y: 100 })).toBe(true)
      expect(result.current.isPointInRegion({ x: 30, y: 50 })).toBe(false) // 元の位置
    })
  })

  describe('getSelectionBounds', () => {
    test('矩形選択のバウンディングボックスを返す', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      const bounds = result.current.getSelectionBounds()

      expect(bounds).toEqual({
        x: 10,
        y: 20,
        width: 90,
        height: 100,
      })
    })

    test('オフセットを考慮したバウンディングボックスを返す', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 100, y: 120 })
      })

      const bounds = result.current.getSelectionBounds()

      expect(bounds).toEqual({
        x: 60, // 10 + 50
        y: 70, // 20 + 50
        width: 90,
        height: 100,
      })
    })

    test('選択がない場合はnullを返す', () => {
      const { result } = renderHook(() => useSelection())

      const bounds = result.current.getSelectionBounds()

      expect(bounds).toBeNull()
    })
  })

  describe('ImageDataキャッシュ', () => {
    test('setRegionImageDataでImageDataをキャッシュできる', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      const mockImageData = new ImageData(90, 100)

      act(() => {
        result.current.setRegionImageData(mockImageData)
      })

      expect(result.current.state.region?.imageData).toBe(mockImageData)
    })

    test('clearRegionImageDataでキャッシュをクリアできる', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      const mockImageData = new ImageData(90, 100)

      act(() => {
        result.current.setRegionImageData(mockImageData)
      })

      expect(result.current.state.region?.imageData).toBe(mockImageData)

      act(() => {
        result.current.clearRegionImageData()
      })

      expect(result.current.state.region?.imageData).toBeNull()
    })

    test('regionがない場合はsetRegionImageDataは何もしない', () => {
      const { result } = renderHook(() => useSelection())

      const mockImageData = new ImageData(90, 100)

      act(() => {
        result.current.setRegionImageData(mockImageData)
      })

      expect(result.current.state.region).toBeNull()
    })

    test('regionがない場合はclearRegionImageDataは何もしない', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.clearRegionImageData()
      })

      expect(result.current.state.region).toBeNull()
    })

    test('移動後もImageDataキャッシュは保持される', () => {
      const { result } = renderHook(() => useSelection())

      act(() => {
        result.current.startSelection({ x: 10, y: 20 }, mockLayerId)
      })
      act(() => {
        result.current.updateSelection({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitSelection()
      })

      const mockImageData = new ImageData(90, 100)

      act(() => {
        result.current.setRegionImageData(mockImageData)
      })

      // 移動開始〜確定
      act(() => {
        result.current.startMove({ x: 50, y: 70 })
      })
      act(() => {
        result.current.updateMove({ x: 100, y: 120 })
      })
      act(() => {
        result.current.commitMove()
      })

      // ImageDataは保持されている
      expect(result.current.state.region?.imageData).toBe(mockImageData)
    })
  })
})
