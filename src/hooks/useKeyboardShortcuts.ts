import { useEffect } from 'react'

/**
 * キーボードショートカットハンドラの型
 */
export type KeyboardShortcutsHandlers = {
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
  readonly onSelectPen: () => void
  readonly onSelectEraser: () => void
  readonly onSelectHand: () => void
  readonly onSelectEyedropper: () => void
}

/**
 * キーボードショートカットを管理するhook
 * - Ctrl+Z / Cmd+Z: 元に戻す
 * - Ctrl+Shift+Z / Cmd+Shift+Z: やり直す
 * - Ctrl+Delete / Cmd+Backspace: レイヤーをクリア
 * - P: ペンツール選択
 * - E: 消しゴムツール選択
 * - H: ハンドツール選択
 * - I: スポイトツール選択
 * @param handlers - ショートカットに対応するコールバック関数
 */
export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onClear,
  onSelectPen,
  onSelectEraser,
  onSelectHand,
  onSelectEyedropper,
}: KeyboardShortcutsHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はスキップ
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        onClear()
        return
      }
      // 修飾キーなしの単一キー
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault()
          onSelectPen()
          return
        }
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          onSelectEraser()
          return
        }
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault()
          onSelectHand()
          return
        }
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault()
          onSelectEyedropper()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUndo, onRedo, onClear, onSelectPen, onSelectEraser, onSelectHand, onSelectEyedropper])
}
