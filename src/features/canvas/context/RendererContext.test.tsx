import { describe, test, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { RendererProvider } from './RendererContext'
import { useRendererEngine, useIsPixiEngine } from './useRendererEngine'

describe('RendererContext', () => {
  describe('useRendererEngine', () => {
    test('Provider外ではデフォルト値canvasを返す', () => {
      const { result } = renderHook(() => useRendererEngine())

      expect(result.current).toBe('canvas')
    })

    test('Providerでpixiを指定するとpixiを返す', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RendererProvider engineType="pixi">{children}</RendererProvider>
      )

      const { result } = renderHook(() => useRendererEngine(), { wrapper })

      expect(result.current).toBe('pixi')
    })

    test('Providerでcanvasを指定するとcanvasを返す', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RendererProvider engineType="canvas">{children}</RendererProvider>
      )

      const { result } = renderHook(() => useRendererEngine(), { wrapper })

      expect(result.current).toBe('canvas')
    })
  })

  describe('useIsPixiEngine', () => {
    test('Provider外ではfalseを返す（デフォルトはcanvas）', () => {
      const { result } = renderHook(() => useIsPixiEngine())

      expect(result.current).toBe(false)
    })

    test('Providerでpixiを指定するとtrueを返す', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RendererProvider engineType="pixi">{children}</RendererProvider>
      )

      const { result } = renderHook(() => useIsPixiEngine(), { wrapper })

      expect(result.current).toBe(true)
    })

    test('Providerでcanvasを指定するとfalseを返す', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RendererProvider engineType="canvas">{children}</RendererProvider>
      )

      const { result } = renderHook(() => useIsPixiEngine(), { wrapper })

      expect(result.current).toBe(false)
    })
  })
})
