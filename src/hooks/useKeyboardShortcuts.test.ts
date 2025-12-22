import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let mockHandlers: {
    onUndo: ReturnType<typeof vi.fn>
    onRedo: ReturnType<typeof vi.fn>
    onClear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockHandlers = {
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onClear: vi.fn(),
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
    it('Ctrl+Zでundo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { ctrlKey: true })

      expect(mockHandlers.onUndo).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onRedo).not.toHaveBeenCalled()
      unmount()
    })

    it('Cmd+Z (Mac)でundo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { metaKey: true })

      expect(mockHandlers.onUndo).toHaveBeenCalledTimes(1)
      unmount()
    })

    it('修飾キーなしのZは無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z')

      expect(mockHandlers.onUndo).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('Redo (Ctrl+Shift+Z / Cmd+Shift+Z)', () => {
    it('Ctrl+Shift+Zでredo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { ctrlKey: true, shiftKey: true })

      expect(mockHandlers.onRedo).toHaveBeenCalledTimes(1)
      expect(mockHandlers.onUndo).not.toHaveBeenCalled()
      unmount()
    })

    it('Cmd+Shift+Z (Mac)でredo', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('z', { metaKey: true, shiftKey: true })

      expect(mockHandlers.onRedo).toHaveBeenCalledTimes(1)
      unmount()
    })
  })

  describe('Clear (Shift+Delete)', () => {
    it('Shift+Deleteでclear', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Delete', { shiftKey: true })

      expect(mockHandlers.onClear).toHaveBeenCalledTimes(1)
      unmount()
    })

    it('Deleteのみは無視', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      dispatchKeyDown('Delete')

      expect(mockHandlers.onClear).not.toHaveBeenCalled()
      unmount()
    })
  })

  describe('クリーンアップ', () => {
    it('アンマウント時にイベントリスナーを削除', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers))

      unmount()
      dispatchKeyDown('z', { ctrlKey: true })

      expect(mockHandlers.onUndo).not.toHaveBeenCalled()
    })
  })
})
