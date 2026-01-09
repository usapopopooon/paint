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
  readonly onSelectRectangle?: () => void
  readonly onSelectLasso?: () => void
  readonly onSelectAll?: () => void
  readonly onDeselect?: () => void
  readonly onDeleteSelection?: () => void
  readonly onCopySelection?: () => void
  readonly onCutSelection?: () => void
  readonly onPasteSelection?: () => void
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onZoomReset: () => void
  readonly onFlipHorizontal: () => void
  readonly onMoveLayerUp: () => void
  readonly onMoveLayerDown: () => void
  readonly onIncreaseToolSize: () => void
  readonly onDecreaseToolSize: () => void
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
 * - ]: ツールサイズを大きく
 * - [: ツールサイズを小さく
 * - P: ペンツール選択
 * - B: ブラシツール選択
 * - E: 消しゴムツール選択
 * - H: ハンドツール選択
 * - I: スポイトツール選択
 * - M: 矩形選択ツール選択
 * - L: 自由選択ツール選択
 * - Escape: 選択解除
 * - Delete/Backspace: 選択領域を削除
 * - Ctrl+A / Cmd+A: すべて選択
 * - Ctrl+D / Cmd+D: 選択解除
 * - Ctrl+C / Cmd+C: 選択領域をコピー
 * - Ctrl+X / Cmd+X: 選択領域をカット
 * - Ctrl+V / Cmd+V: ペースト
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
  onSelectRectangle,
  onSelectLasso,
  onSelectAll,
  onDeselect,
  onDeleteSelection,
  onCopySelection,
  onCutSelection,
  onPasteSelection,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFlipHorizontal,
  onMoveLayerUp,
  onMoveLayerDown,
  onIncreaseToolSize,
  onDecreaseToolSize,
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
      // すべて選択 (Ctrl/Cmd + A)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A') && onSelectAll) {
        e.preventDefault()
        onSelectAll()
        return
      }
      // 選択解除 (Ctrl/Cmd + D)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && onDeselect) {
        e.preventDefault()
        onDeselect()
        return
      }
      // コピー (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && onCopySelection) {
        e.preventDefault()
        onCopySelection()
        return
      }
      // カット (Ctrl/Cmd + X)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'x' || e.key === 'X') && onCutSelection) {
        e.preventDefault()
        onCutSelection()
        return
      }
      // ペースト (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V') && onPasteSelection) {
        e.preventDefault()
        onPasteSelection()
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
        if ((e.key === 'm' || e.key === 'M') && onSelectRectangle) {
          e.preventDefault()
          onSelectRectangle()
          return
        }
        if ((e.key === 'l' || e.key === 'L') && onSelectLasso) {
          e.preventDefault()
          onSelectLasso()
          return
        }
        if (e.key === 'Escape' && onDeselect) {
          e.preventDefault()
          onDeselect()
          return
        }
        // 選択領域を削除 (Delete/Backspace)
        if ((e.key === 'Delete' || e.key === 'Backspace') && onDeleteSelection) {
          e.preventDefault()
          onDeleteSelection()
          return
        }
        // ツールサイズ変更 (] で大きく、[ で小さく)
        if (e.key === ']') {
          e.preventDefault()
          onIncreaseToolSize()
          return
        }
        if (e.key === '[') {
          e.preventDefault()
          onDecreaseToolSize()
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
    onSelectRectangle,
    onSelectLasso,
    onSelectAll,
    onDeselect,
    onDeleteSelection,
    onCopySelection,
    onCutSelection,
    onPasteSelection,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onFlipHorizontal,
    onMoveLayerUp,
    onMoveLayerDown,
    onIncreaseToolSize,
    onDecreaseToolSize,
  ])
}
