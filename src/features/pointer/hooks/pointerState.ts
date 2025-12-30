import { isPrimaryButton, isPrimaryButtonPressed } from '../helpers'

/** ポインター移動時のコールバック型 */
type PointerMoveCallback = (x: number, y: number, event: PointerEvent) => void

/**
 * ウィンドウレベルでポインター状態を追跡するグローバル状態
 */
export const pointerState = {
  /** プライマリボタンを押し続けているか */
  isPrimaryPressing: false,
  /** ポインター移動時のコールバック */
  onPointerMove: null as PointerMoveCallback | null,
}

/**
 * ポインター移動時のコールバックを設定
 */
export const setPointerMoveCallback = (callback: PointerMoveCallback | null): void => {
  pointerState.onPointerMove = callback
}

// ウィンドウレベルでポインター状態を追跡
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (event) => {
    if (isPrimaryButton(event.button)) {
      pointerState.isPrimaryPressing = true
    }
  })

  window.addEventListener('pointerup', (event) => {
    if (isPrimaryButton(event.button)) {
      pointerState.isPrimaryPressing = false
    }
  })

  window.addEventListener('pointercancel', () => {
    pointerState.isPrimaryPressing = false
  })

  window.addEventListener('pointermove', (event) => {
    if (isPrimaryButtonPressed(event.buttons)) {
      pointerState.onPointerMove?.(event.clientX, event.clientY, event)
    }
  })
}
