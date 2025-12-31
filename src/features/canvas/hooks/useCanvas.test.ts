import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvas } from './useCanvas'
import { BACKGROUND_LAYER_ID } from '@/features/layer'

describe('useCanvas', () => {
  describe('背景レイヤー', () => {
    it('初期状態で背景レイヤーが存在する', () => {
      const { result } = renderHook(() => useCanvas())

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer).toBeDefined()
    })

    it('初期状態で背景レイヤーは非表示', () => {
      const { result } = renderHook(() => useCanvas())

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer?.isVisible).toBe(false)
    })

    it('showBackgroundLayerで背景レイヤーを表示できる', () => {
      const { result } = renderHook(() => useCanvas())

      act(() => {
        result.current.showBackgroundLayer()
      })

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer?.isVisible).toBe(true)
    })

    it('hideBackgroundLayerで背景レイヤーを非表示にできる', () => {
      const { result } = renderHook(() => useCanvas())

      // まず表示
      act(() => {
        result.current.showBackgroundLayer()
      })

      // 非表示に戻す
      act(() => {
        result.current.hideBackgroundLayer()
      })

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer?.isVisible).toBe(false)
    })

    it('背景レイヤーはアクティブレイヤーではない', () => {
      const { result } = renderHook(() => useCanvas())

      expect(result.current.activeLayerId).not.toBe(BACKGROUND_LAYER_ID)
    })
  })
})
