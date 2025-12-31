import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useCanvas } from './useCanvas'
import { BACKGROUND_LAYER_ID } from '@/features/layer'
import { LocaleProvider } from '@/features/i18n/hooks/LocaleProvider'

// Mock storage
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <LocaleProvider defaultLocale="ja">{children}</LocaleProvider>
)

describe('useCanvas', () => {
  describe('背景レイヤー', () => {
    test('初期状態で背景レイヤーが存在する', () => {
      const { result } = renderHook(() => useCanvas(), { wrapper })

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer).toBeDefined()
    })

    test('初期状態で背景レイヤーは非表示', () => {
      const { result } = renderHook(() => useCanvas(), { wrapper })

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer?.isVisible).toBe(false)
    })

    test('showBackgroundLayerで背景レイヤーを表示できる', () => {
      const { result } = renderHook(() => useCanvas(), { wrapper })

      act(() => {
        result.current.showBackgroundLayer()
      })

      const backgroundLayer = result.current.layers.find(
        (layer) => layer.id === BACKGROUND_LAYER_ID
      )
      expect(backgroundLayer?.isVisible).toBe(true)
    })

    test('hideBackgroundLayerで背景レイヤーを非表示にできる', () => {
      const { result } = renderHook(() => useCanvas(), { wrapper })

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

    test('背景レイヤーはアクティブレイヤーではない', () => {
      const { result } = renderHook(() => useCanvas(), { wrapper })

      expect(result.current.activeLayerId).not.toBe(BACKGROUND_LAYER_ID)
    })
  })
})
