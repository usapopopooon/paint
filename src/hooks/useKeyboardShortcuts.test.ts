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
      onSelectBlur: vi.fn(),
      onSelectEraser: vi.fn(),
      onSelectHand: vi.fn(),
      onSelectEyedropper: vi.fn(),
      onZoomIn: vi.fn(),
      onZoomOut: vi.fn(),
      onZoomReset: vi.fn(),
      onFlipHorizontal: vi.fn(),
      onFlipVertical: vi.fn(),
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

    test('Uキーでぼかしツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('u')

      expect(mockHandlers.onSelectBlur).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onSelectPen).not.toHaveBeenCalled()
      expect(mockHandlers.onSelectBrush).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Uでもぼかしツール選択', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('U')

      expect(mockHandlers.onSelectBlur).toHaveBeenCalledTimes(1)
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

  describe('上下反転 (Ctrl+Shift+H / Cmd+Shift+H)', () => {
    test('Ctrl+Shift+Hで上下反転', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h', { ctrlKey: true, shiftKey: true })

      expect(mockHandlers.onFlipVertical).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onFlipHorizontal).not.toHaveBeenCalled()
      unmount()
    })

    test('Cmd+Shift+H (Mac)で上下反転', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('h', { metaKey: true, shiftKey: true })

      expect(mockHandlers.onFlipVertical).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onFlipHorizontal).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Hでも上下反転', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('H', { ctrlKey: true, shiftKey: true })

      expect(mockHandlers.onFlipVertical).toHaveBeenCalledTimes(1)
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

  describe('選択ツール (M / L)', () => {
    test('Mキーで矩形選択ツール選択', () => {
      const handlersWithSelection = {
        ...mockHandlers,
        onSelectRectangle: vi.fn(),
        onSelectLasso: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelection))

      dispatchKeyDown('m')

      expect(handlersWithSelection.onSelectRectangle).toHaveBeenCalledTimes(1)
      expect(handlersWithSelection.onSelectLasso).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Mでも矩形選択ツール選択', () => {
      const handlersWithSelection = {
        ...mockHandlers,
        onSelectRectangle: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelection))

      dispatchKeyDown('M')

      expect(handlersWithSelection.onSelectRectangle).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onSelectRectangleがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('m')

      // エラーが発生しないことを確認
      unmount()
    })

    test('Lキーで自由選択ツール選択', () => {
      const handlersWithSelection = {
        ...mockHandlers,
        onSelectRectangle: vi.fn(),
        onSelectLasso: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelection))

      dispatchKeyDown('l')

      expect(handlersWithSelection.onSelectLasso).toHaveBeenCalledTimes(1)
      expect(handlersWithSelection.onSelectRectangle).not.toHaveBeenCalled()
      unmount()
    })

    test('大文字Lでも自由選択ツール選択', () => {
      const handlersWithSelection = {
        ...mockHandlers,
        onSelectLasso: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelection))

      dispatchKeyDown('L')

      expect(handlersWithSelection.onSelectLasso).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onSelectLassoがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('l')

      // エラーが発生しないことを確認
      unmount()
    })

    test('Ctrl+Mは矩形選択ツール選択しない', () => {
      const handlersWithSelection = {
        ...mockHandlers,
        onSelectRectangle: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelection))

      dispatchKeyDown('m', { ctrlKey: true })

      expect(handlersWithSelection.onSelectRectangle).not.toHaveBeenCalled()
      unmount()
    })

    test('Ctrl+Lは自由選択ツール選択しない', () => {
      const handlersWithSelection = {
        ...mockHandlers,
        onSelectLasso: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelection))

      dispatchKeyDown('l', { ctrlKey: true })

      expect(handlersWithSelection.onSelectLasso).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('すべて選択 (Ctrl+A / Cmd+A)', () => {
    test('Ctrl+Aですべて選択', () => {
      const handlersWithSelectAll = {
        ...mockHandlers,
        onSelectAll: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelectAll))

      dispatchKeyDown('a', { ctrlKey: true })

      expect(handlersWithSelectAll.onSelectAll).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+A (Mac)ですべて選択', () => {
      const handlersWithSelectAll = {
        ...mockHandlers,
        onSelectAll: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelectAll))

      dispatchKeyDown('a', { metaKey: true })

      expect(handlersWithSelectAll.onSelectAll).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('大文字Aでもすべて選択', () => {
      const handlersWithSelectAll = {
        ...mockHandlers,
        onSelectAll: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelectAll))

      dispatchKeyDown('A', { ctrlKey: true })

      expect(handlersWithSelectAll.onSelectAll).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onSelectAllがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('a', { ctrlKey: true })

      // エラーが発生しないことを確認
      unmount()
    })

    test('修飾キーなしのAは無視', () => {
      const handlersWithSelectAll = {
        ...mockHandlers,
        onSelectAll: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithSelectAll))

      dispatchKeyDown('a')

      expect(handlersWithSelectAll.onSelectAll).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('選択解除 (Escape / Ctrl+D / Cmd+D)', () => {
    test('Escapeで選択解除', () => {
      const handlersWithDeselect = {
        ...mockHandlers,
        onDeselect: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDeselect))

      dispatchKeyDown('Escape')

      expect(handlersWithDeselect.onDeselect).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Ctrl+Dで選択解除', () => {
      const handlersWithDeselect = {
        ...mockHandlers,
        onDeselect: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDeselect))

      dispatchKeyDown('d', { ctrlKey: true })

      expect(handlersWithDeselect.onDeselect).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+D (Mac)で選択解除', () => {
      const handlersWithDeselect = {
        ...mockHandlers,
        onDeselect: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDeselect))

      dispatchKeyDown('d', { metaKey: true })

      expect(handlersWithDeselect.onDeselect).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('大文字Dでも選択解除', () => {
      const handlersWithDeselect = {
        ...mockHandlers,
        onDeselect: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDeselect))

      dispatchKeyDown('D', { ctrlKey: true })

      expect(handlersWithDeselect.onDeselect).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onDeselectがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Escape')

      // エラーが発生しないことを確認
      unmount()
    })

    test('Ctrl+Escapeは選択解除しない', () => {
      const handlersWithDeselect = {
        ...mockHandlers,
        onDeselect: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDeselect))

      dispatchKeyDown('Escape', { ctrlKey: true })

      expect(handlersWithDeselect.onDeselect).not.toHaveBeenCalled()
      unmount()
    })

    test('修飾キーなしのDは無視', () => {
      const handlersWithDeselect = {
        ...mockHandlers,
        onDeselect: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDeselect))

      dispatchKeyDown('d')

      expect(handlersWithDeselect.onDeselect).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('選択領域の削除 (Delete / Backspace)', () => {
    test('Deleteで選択領域を削除', () => {
      const handlersWithDelete = {
        ...mockHandlers,
        onDeleteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDelete))

      dispatchKeyDown('Delete')

      expect(handlersWithDelete.onDeleteSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Backspaceで選択領域を削除', () => {
      const handlersWithDelete = {
        ...mockHandlers,
        onDeleteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDelete))

      dispatchKeyDown('Backspace')

      expect(handlersWithDelete.onDeleteSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onDeleteSelectionがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Delete')

      // エラーが発生しないことを確認（onClearも呼ばれない）
      expect(mockHandlers.onClear).not.toHaveBeenCalled()
      unmount()
    })

    test('Ctrl+Deleteはレイヤークリア（選択削除ではない）', () => {
      const handlersWithDelete = {
        ...mockHandlers,
        onDeleteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithDelete))

      dispatchKeyDown('Delete', { ctrlKey: true })

      expect(handlersWithDelete.onDeleteSelection).not.toHaveBeenCalled()
      expect(mockHandlers.onClear).toHaveBeenCalledTimes(1)
      unmount()
    })
  })

  describe('コピー (Ctrl+C / Cmd+C)', () => {
    test('Ctrl+Cでコピー', () => {
      const handlersWithCopy = {
        ...mockHandlers,
        onCopySelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCopy))

      dispatchKeyDown('c', { ctrlKey: true })

      expect(handlersWithCopy.onCopySelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+C (Mac)でコピー', () => {
      const handlersWithCopy = {
        ...mockHandlers,
        onCopySelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCopy))

      dispatchKeyDown('c', { metaKey: true })

      expect(handlersWithCopy.onCopySelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('大文字Cでもコピー', () => {
      const handlersWithCopy = {
        ...mockHandlers,
        onCopySelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCopy))

      dispatchKeyDown('C', { ctrlKey: true })

      expect(handlersWithCopy.onCopySelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onCopySelectionがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('c', { ctrlKey: true })

      // エラーが発生しないことを確認
      unmount()
    })

    test('修飾キーなしのCは無視', () => {
      const handlersWithCopy = {
        ...mockHandlers,
        onCopySelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCopy))

      dispatchKeyDown('c')

      expect(handlersWithCopy.onCopySelection).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('カット (Ctrl+X / Cmd+X)', () => {
    test('Ctrl+Xでカット', () => {
      const handlersWithCut = {
        ...mockHandlers,
        onCutSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCut))

      dispatchKeyDown('x', { ctrlKey: true })

      expect(handlersWithCut.onCutSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+X (Mac)でカット', () => {
      const handlersWithCut = {
        ...mockHandlers,
        onCutSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCut))

      dispatchKeyDown('x', { metaKey: true })

      expect(handlersWithCut.onCutSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('大文字Xでもカット', () => {
      const handlersWithCut = {
        ...mockHandlers,
        onCutSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCut))

      dispatchKeyDown('X', { ctrlKey: true })

      expect(handlersWithCut.onCutSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onCutSelectionがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('x', { ctrlKey: true })

      // エラーが発生しないことを確認
      unmount()
    })

    test('修飾キーなしのXは無視', () => {
      const handlersWithCut = {
        ...mockHandlers,
        onCutSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithCut))

      dispatchKeyDown('x')

      expect(handlersWithCut.onCutSelection).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('ペースト (Ctrl+V / Cmd+V)', () => {
    test('Ctrl+Vでペースト', () => {
      const handlersWithPaste = {
        ...mockHandlers,
        onPasteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithPaste))

      dispatchKeyDown('v', { ctrlKey: true })

      expect(handlersWithPaste.onPasteSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('Cmd+V (Mac)でペースト', () => {
      const handlersWithPaste = {
        ...mockHandlers,
        onPasteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithPaste))

      dispatchKeyDown('v', { metaKey: true })

      expect(handlersWithPaste.onPasteSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('大文字Vでもペースト', () => {
      const handlersWithPaste = {
        ...mockHandlers,
        onPasteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithPaste))

      dispatchKeyDown('V', { ctrlKey: true })

      expect(handlersWithPaste.onPasteSelection).toHaveBeenCalledTimes(1)
      unmount()
    })

    test('onPasteSelectionがundefinedの場合は何もしない', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('v', { ctrlKey: true })

      // エラーが発生しないことを確認
      unmount()
    })

    test('修飾キーなしのVは無視', () => {
      const handlersWithPaste = {
        ...mockHandlers,
        onPasteSelection: vi.fn(),
      }
      const { unmount } = renderHook(() => useKeyboardShortcuts(handlersWithPaste))

      dispatchKeyDown('v')

      expect(handlersWithPaste.onPasteSelection).not.toHaveBeenCalled()
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
