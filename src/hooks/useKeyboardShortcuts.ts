import { useEffect } from 'react'

/**
 * キーボードショートカットハンドラの型
 */
export type KeyboardShortcutsHandlers = {
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
  readonly onSelectPen: () => void
  readonly onSelectBrush: () => void
  readonly onSelectEraser: () => void
  readonly onSelectHand: () => void
  readonly onSelectEyedropper: () => void
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onZoomReset: () => void
  readonly onFlipHorizontal: () => void
  readonly onMoveLayerUp: () => void
  readonly onMoveLayerDown: () => void
}

/**
 * キーボードショートカットを管理するhook
 * - Ctrl+Z / Cmd+Z: 元に戻す
 * - Ctrl+Shift+Z / Cmd+Shift+Z: やり直す
 * - Ctrl+Delete / Cmd+Backspace: レイヤーをクリア
 * - Ctrl++ / Cmd++: ズームイン
 * - Ctrl+- / Cmd+-: ズームアウト
 * - Ctrl+0 / Cmd+0: ズームリセット
 * - Ctrl+H / Cmd+H: 左右反転
 * - Alt+]: レイヤーを上に移動
 * - Alt+[: レイヤーを下に移動
 * - P: ペンツール選択
 * - B: ブラシツール選択
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
  onSelectBrush,
  onSelectEraser,
  onSelectHand,
  onSelectEyedropper,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFlipHorizontal,
  onMoveLayerUp,
  onMoveLayerDown,
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
      // ズームイン (Ctrl/Cmd + + or =)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        onZoomIn()
        return
      }
      // ズームアウト (Ctrl/Cmd + -)
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        onZoomOut()
        return
      }
      // ズームリセット (Ctrl/Cmd + 0)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        onZoomReset()
        return
      }
      // 左右反転 (Ctrl/Cmd + H)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault()
        onFlipHorizontal()
        return
      }
      // レイヤーを上に移動 (Alt + ])
      if (e.altKey && e.key === ']') {
        e.preventDefault()
        onMoveLayerUp()
        return
      }
      // レイヤーを下に移動 (Alt + [)
      if (e.altKey && e.key === '[') {
        e.preventDefault()
        onMoveLayerDown()
        return
      }
      // 修飾キーなしの単一キー
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault()
          onSelectPen()
          return
        }
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault()
          onSelectBrush()
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
  }, [
    onUndo,
    onRedo,
    onClear,
    onSelectPen,
    onSelectBrush,
    onSelectEraser,
    onSelectHand,
    onSelectEyedropper,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onFlipHorizontal,
    onMoveLayerUp,
    onMoveLayerDown,
  ])
}
