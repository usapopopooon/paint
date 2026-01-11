import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTool } from './useTool'
import { penBehavior, eraserBehavior } from '../domain'
import { DEFAULT_PEN_WIDTH, DEFAULT_PEN_COLOR, DEFAULT_ERASER_WIDTH } from '../constants'
import { DEFAULT_HARDNESS } from '../constants/hardness'

describe('useTool', () => {
  describe('初期状態', () => {
    test('noneツールがデフォルトで選択される', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.currentType).toBe('none')
    })

    test('デフォルトのペン設定を持つ', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.penConfig).toEqual(penBehavior.defaultConfig())
    })

    test('デフォルトの消しゴム設定を持つ', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.eraserConfig).toEqual(eraserBehavior.defaultConfig())
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
        size: DEFAULT_PEN_WIDTH,
        color: DEFAULT_PEN_COLOR,
      })
    })

    test('消しゴム選択時のカーソル設定を返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
      })

      expect(result.current.cursor).toEqual({
        size: DEFAULT_ERASER_WIDTH,
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
        size: DEFAULT_PEN_WIDTH,
        color: DEFAULT_PEN_COLOR,
      })
    })
  })

  describe('lastDrawingToolHardness', () => {
    test('初期状態ではデフォルト値を返す', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.lastDrawingToolHardness).toBe(DEFAULT_HARDNESS)
    })

    test('ペン選択後にハンドツールに切り替えてもペンのhardnessを返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
        result.current.setPenHardness(0.3)
      })

      act(() => {
        result.current.setToolType('hand')
      })

      expect(result.current.lastDrawingToolHardness).toBe(0.3)
    })

    test('ブラシ選択後にスポイトに切り替えてもブラシのhardnessを返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('brush')
        result.current.setBrushHardness(0.7)
      })

      act(() => {
        result.current.setToolType('eyedropper')
      })

      expect(result.current.lastDrawingToolHardness).toBe(0.7)
    })

    test('消しゴム選択後にハンドツールに切り替えても消しゴムのhardnessを返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('eraser')
        result.current.setEraserHardness(0.9)
      })

      act(() => {
        result.current.setToolType('hand')
      })

      expect(result.current.lastDrawingToolHardness).toBe(0.9)
    })

    test('複数の描画ツールを切り替えた場合、最後に選択した描画ツールのhardnessを返す', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
        result.current.setPenHardness(0.2)
      })

      act(() => {
        result.current.setToolType('brush')
        result.current.setBrushHardness(0.8)
      })

      act(() => {
        result.current.setToolType('hand')
      })

      // 最後に選択した描画ツールはbrushなので、brushのhardnessを返す
      expect(result.current.lastDrawingToolHardness).toBe(0.8)
    })

    test('非描画ツール選択中に描画ツールのhardnessを変更しても反映される', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      act(() => {
        result.current.setToolType('hand')
      })

      // 非描画ツール選択中にペンのhardnessを変更
      act(() => {
        result.current.setPenHardness(0.1)
      })

      // lastDrawingToolTypeがpenなので、変更が反映される
      expect(result.current.lastDrawingToolHardness).toBe(0.1)
    })
  })

  describe('toolState', () => {
    test('現在のツール状態全体を返す', () => {
      const { result } = renderHook(() => useTool())

      expect(result.current.toolState).toEqual({
        currentType: 'none',
        lastDrawingToolType: null,
        penConfig: penBehavior.defaultConfig(),
        brushConfig: expect.any(Object),
        blurConfig: expect.any(Object),
        eraserConfig: eraserBehavior.defaultConfig(),
      })
    })

    test('ツールタイプ変更がtoolStateに反映される', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setToolType('pen')
      })

      expect(result.current.toolState.currentType).toBe('pen')
      expect(result.current.toolState.lastDrawingToolType).toBe('pen')
    })

    test('設定変更がtoolStateに反映される', () => {
      const { result } = renderHook(() => useTool())

      act(() => {
        result.current.setPenWidth(20)
        result.current.setPenColor('#ff0000')
      })

      expect(result.current.toolState.penConfig.width).toBe(20)
      expect(result.current.toolState.penConfig.color).toBe('#ff0000')
    })
  })

  describe('setFullState', () => {
    test('ツール状態を一括で設定できる', () => {
      const { result } = renderHook(() => useTool())

      const newState = {
        currentType: 'brush' as const,
        lastDrawingToolType: 'brush' as const,
        penConfig: {
          type: 'pen' as const,
          width: 15,
          color: '#00ff00',
          opacity: 0.8,
          hardness: 0.3,
          isBlurEnabled: true,
        },
        brushConfig: {
          type: 'brush' as const,
          width: 30,
          color: '#0000ff',
          opacity: 0.9,
          hardness: 0.6,
          isBlurEnabled: false,
        },
        blurConfig: {
          type: 'blur' as const,
          width: 25,
          opacity: 0.7,
          hardness: 0.4,
        },
        eraserConfig: {
          type: 'eraser' as const,
          width: 40,
          opacity: 1,
          hardness: 0.5,
          isBlurEnabled: true,
        },
      }

      act(() => {
        result.current.setFullState(newState)
      })

      expect(result.current.currentType).toBe('brush')
      expect(result.current.penConfig.width).toBe(15)
      expect(result.current.penConfig.color).toBe('#00ff00')
      expect(result.current.brushConfig.width).toBe(30)
      expect(result.current.eraserConfig.width).toBe(40)
    })

    test('setFullState後に個別設定を変更できる', () => {
      const { result } = renderHook(() => useTool())

      const newState = {
        currentType: 'pen' as const,
        lastDrawingToolType: 'pen' as const,
        penConfig: {
          type: 'pen' as const,
          width: 10,
          color: '#000000',
          opacity: 1,
          hardness: 0.5,
          isBlurEnabled: true,
        },
        brushConfig: {
          type: 'brush' as const,
          width: 20,
          color: '#000000',
          opacity: 1,
          hardness: 0.5,
          isBlurEnabled: true,
        },
        blurConfig: {
          type: 'blur' as const,
          width: 20,
          opacity: 1,
          hardness: 0.5,
        },
        eraserConfig: {
          type: 'eraser' as const,
          width: 50,
          opacity: 1,
          hardness: 0.5,
          isBlurEnabled: true,
        },
      }

      act(() => {
        result.current.setFullState(newState)
      })

      act(() => {
        result.current.setPenWidth(25)
      })

      expect(result.current.penConfig.width).toBe(25)
    })
  })
})
