import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts, type KeyboardShortcutsHandlers } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let mockHandlers: KeyboardShortcutsHandlers

  beforeEach(() => {
    mockHandlers = {
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onClear: vi.fn(),
      onSelectPen: vi.fn(),
      onSelectBrush: vi.fn(),
      onSelectEraser: vi.fn(),
      onSelectHand: vi.fn(),
      onSelectEyedropper: vi.fn(),
      onZoomIn: vi.fn(),
      onZoomOut: vi.fn(),
      onZoomReset: vi.fn(),
      onFlipHorizontal: vi.fn(),
      onMoveLayerUp: vi.fn(),
      onMoveLayerDown: vi.fn(),
      onIncreaseToolSize: vi.fn(),
      onDecreaseToolSize: vi.fn(),
    }
  })

  const dispatchKeyDown = (key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      ...options,
    })
    act(() => {
      window.dispatchEvent(event)
    })
  }

  describe('Undo (Ctrl+Z / Cmd+Z)', () => {
    test('Ctrl+Zでundo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { ctrlKey: true })

      expect(mockHandlers.onUndo).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onRedo).not.toHaveBeenCalled()
      unmount()
    })

    test('Cmd+Z (Mac)でundo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { metaKey: true })

      expect(mockHandlers.onUndo).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('修飾キーなしのZは無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z')

      expect(mockHandlers.onUndo).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('Redo (Ctrl+Shift+Z / Cmd+Shift+Z)', () => {
    test('Ctrl+Shift+Zでredo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { ctrlKey: true, shiftKey: true })

      expect(mockHandlers.onRedo).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onUndo).not.toHaveBeenCalled()
      unmount()
    })

    test('Cmd+Shift+Z (Mac)でredo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { metaKey: true, shiftKey: true })

      expect(mockHandlers.onRedo).toHaveBeenCalledTimes(1)
      unmount()
    })
  })

  describe('Clear (Ctrl+Delete / Cmd+Backspace)', () => {
    test('Ctrl+Deleteでclear', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Delete', { ctrlKey: true })

      expect(mockHandlers.onClear).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+Backspaceでclear', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Backspace', { ctrlKey: true })

      expect(mockHandlers.onClear).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+Backspace (Mac)でclear', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Backspace', { metaKey: true })

      expect(mockHandlers.onClear).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Deleteのみは無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Delete')

      expect(mockHandlers.onClear).not.toHaveBeenCalled()
      unmount()
    })

    test('Backspaceのみは無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Backspace')

      expect(mockHandlers.onClear).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('ツール選択 (P / B / E / H / I)', () => {
    test('Pキーでペンツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('p')

      expect(mockHandlers.onSelectPen).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onSelectEraser).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectHand).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Pでもペンツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('P')

      expect(mockHandlers.onSelectPen).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Bキーでブラシツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('b')

      expect(mockHandlers.onSelectBrush).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onSelectPen).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectEraser).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Bでもブラシツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('B')

      expect(mockHandlers.onSelectBrush).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Eキーで消しゴムツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('e')

      expect(mockHandlers.onSelectEraser).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onSelectPen).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectHand).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Eでも消しゴムツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('E')

      expect(mockHandlers.onSelectEraser).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Hキーでハンドツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h')

      expect(mockHandlers.onSelectHand).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onSelectPen).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectEraser).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Hでもハンドツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('H')

      expect(mockHandlers.onSelectHand).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+Pはペンツール選択しない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('p', { ctrlKey: true })

      expect(mockHandlers.onSelectPen).not.toHaveBeenCalled()
      unmount()
    })

    test('Ctrl+Hはハンドツール選択しない（左右反転が発動）', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h', { ctrlKey: true })

      expect(mockHandlers.onSelectHand).not.toHaveBeenCalled()
      expect(mockHandlers.onFlipHorizontal).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Iキーでスポイトツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('i')

      expect(mockHandlers.onSelectEyedropper).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onSelectPen).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectEraser).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectHand).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Iでもスポイトツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('I')

      expect(mockHandlers.onSelectEyedropper).toHaveBeenCalledTimes(1)
      unmount()
    })
  })

  describe('ズーム (Ctrl++/- / Cmd++/-)', () => {
    test('Ctrl++でズームイン', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('+', { ctrlKey: true })

      expect(mockHandlers.onZoomIn).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+=でズームイン', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('=', { ctrlKey: true })

      expect(mockHandlers.onZoomIn).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd++ (Mac)でズームイン', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('+', { metaKey: true })

      expect(mockHandlers.onZoomIn).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+-でズームアウト', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('-', { ctrlKey: true })

      expect(mockHandlers.onZoomOut).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+- (Mac)でズームアウト', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('-', { metaKey: true })

      expect(mockHandlers.onZoomOut).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+0でズームリセット', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('0', { ctrlKey: true })

      expect(mockHandlers.onZoomReset).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+0 (Mac)でズームリセット', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('0', { metaKey: true })

      expect(mockHandlers.onZoomReset).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('修飾キーなしの+は無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('+')

      expect(mockHandlers.onZoomIn).not.toHaveBeenCalled()
      unmount()
    })

    test('修飾キーなしの-は無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('-')

      expect(mockHandlers.onZoomOut).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('左右反転 (Ctrl+H / Cmd+H)', () => {
    test('Ctrl+Hで左右反転', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h', { ctrlKey: true })

      expect(mockHandlers.onFlipHorizontal).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+H (Mac)で左右反転', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h', { metaKey: true })

      expect(mockHandlers.onFlipHorizontal).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('大文字Hでも左右反転', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('H', { ctrlKey: true })

      expect(mockHandlers.onFlipHorizontal).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('修飾キーなしのHはハンドツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h')

      expect(mockHandlers.onFlipHorizontal).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectHand).toHaveBeenCalledTimes(1)
      unmount()
    })
  })

  describe('ツールサイズ変更 (] / [)', () => {
    test(']キーでツールサイズを大きく', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown(']')

      expect(mockHandlers.onIncreaseToolSize).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onDecreaseToolSize).not.toHaveBeenCalled()
      unmount()
    })

    test('[キーでツールサイズを小さく', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('[')

      expect(mockHandlers.onDecreaseToolSize).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onIncreaseToolSize).not.toHaveBeenCalled()
      unmount()
    })

    test('Alt+]はレイヤー移動（ツールサイズ変更しない）', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown(']', { altKey: true })

      expect(mockHandlers.onIncreaseToolSize).not.toHaveBeenCalled()
      expect(mockHandlers.onMoveLayerUp).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Alt+[はレイヤー移動（ツールサイズ変更しない）', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('[', { altKey: true })

      expect(mockHandlers.onDecreaseToolSize).not.toHaveBeenCalled()
      expect(mockHandlers.onMoveLayerDown).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+]はツールサイズ変更しない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown(']', { ctrlKey: true })

      expect(mockHandlers.onIncreaseToolSize).not.toHaveBeenCalled()
      unmount()
    })

    test('Ctrl+[はツールサイズ変更しない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('[', { ctrlKey: true })

      expect(mockHandlers.onDecreaseToolSize).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('クリーンアップ', () => {
    test('アンマウント時にイベントリスナーを削除', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      unmount()
      dispatchKeyDown('z', { ctrlKey: true })

      expect(mockHandlers.onUndo).not.toHaveBeenCalled()
    })
  })
})
