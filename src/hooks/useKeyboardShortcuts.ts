import { useEffect } from 'react'

type KeyboardShortcutsHandlers = {
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
}

/**
 * キーボードショートカットを管理するhook
 * - Ctrl+Z / Cmd+Z: 元に戻す
 * - Ctrl+Shift+Z / Cmd+Shift+Z: やり直す
 * - Shift+Delete: クリア
 */
export const useKeyboardShortcuts = ({ onUndo, onRedo, onClear }: KeyboardShortcutsHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
      }
      if (e.shiftKey && e.key === 'Delete') {
        e.preventDefault()
        onClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUndo, onRedo, onClear])
}
