import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTool } from './useTool'

describe('useTool', () => {
  describe('初期状態', () => {
    test('ハンドツールがデフォルトで選択される', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.currentType).toBe('hand')
    })

    test('デフォルトのペン設定を持つ', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.penConfig).toEqual({
        type: 'pen',
        width: 3,
        color: '#000000',
      })
    })

    test('デフォルトの消しゴム設定を持つ', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.eraserConfig).toEqual({
        type: 'eraser',
        width: 20,
      })
    })
  })

  describe('setToolType', () => {
    test('ツールタイプを消しゴムに切り替える', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
      })

      expect(result.current.currentType).toBe('eraser')
    })

    test('ツールタイプをペンに切り替える', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
        result.current.setToolType('pen')
      })

      expect(result.current.currentType).toBe('pen')
    })
  })

  describe('setPenWidth', () => {
    test('ペンの幅を変更する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setPenWidth(10)
      })

      expect(result.current.penConfig.width).toBe(10)
    })
  })

  describe('setPenColor', () => {
    test('ペンの色を変更する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setPenColor('#ff0000')
      })

      expect(result.current.penConfig.color).toBe('#ff0000')
    })
  })

  describe('setEraserWidth', () => {
    test('消しゴムの幅を変更する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setEraserWidth(30)
      })

      expect(result.current.eraserConfig.width).toBe(30)
    })
  })

  describe('currentConfig', () => {
    test('ペン選択時はpenConfigを返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      expect(result.current.currentConfig).toEqual(result.current.penConfig)
    })

    test('消しゴム選択時はeraserConfigを返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
      })

      expect(result.current.currentConfig).toEqual(result.current.eraserConfig)
    })
  })

  describe('cursor', () => {
    test('ペン選択時のカーソル設定を返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      expect(result.current.cursor).toEqual({
        size: 3,
        color: '#000000',
      })
    })

    test('消しゴム選択時のカーソル設定を返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
      })

      expect(result.current.cursor).toEqual({
        size: 20,
        color: '#888888',
        outline: '#ffffff',
      })
    })

    test('ペンの幅変更に追従する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
        result.current.setPenWidth(15)
      })

      expect(result.current.cursor.size).toBe(15)
    })

    test('消しゴムの幅変更に追従する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
        result.current.setEraserWidth(40)
      })

      expect(result.current.cursor.size).toBe(40)
    })
  })

  describe('getCursor', () => {
    test('背景色を指定してカーソル設定を取得する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      const cursor = result.current.getCursor('#000000')

      expect(cursor).toEqual({
        size: 3,
        color: '#000000',
      })
    })
  })

  describe('adjustBrushSize', () => {
    test('正のdeltaYでペンサイズが縮小する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      const initialWidth = result.current.penConfig.width

      act(() => {
        result.current.adjustBrushSize(100)
      })

      expect(result.current.penConfig.width).toBeLessThan(initialWidth)
    })

    test('負のdeltaYでペンサイズが拡大する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      const initialWidth = result.current.penConfig.width

      act(() => {
        result.current.adjustBrushSize(-100)
      })

      expect(result.current.penConfig.width).toBeGreaterThan(initialWidth)
    })

    test('消しゴム選択時は消しゴムサイズを調整する', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
      })

      const initialWidth = result.current.eraserConfig.width

      act(() => {
        result.current.adjustBrushSize(-100)
      })

      expect(result.current.eraserConfig.width).toBeGreaterThan(initialWidth)
    })

    test('最小値を下回らない', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      // 複数回縮小操作を実行
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.adjustBrushSize(100)
        }
      })

      expect(result.current.penConfig.width).toBeGreaterThanOrEqual(1)
    })

    test('最大値を超えない', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      // 複数回拡大操作を実行
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.adjustBrushSize(-100)
        }
      })

      expect(result.current.penConfig.width).toBeLessThanOrEqual(300)
    })
  })
})
