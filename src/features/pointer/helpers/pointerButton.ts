/** プライマリボタン（左クリック）のボタン値 */
const PRIMARY_BUTTON = 0

/** プライマリボタンのビットマスク */
const PRIMARY_BUTTON_MASK = 1

/**
 * pointerdown/pointerup時にプライマリボタンが押されたかを判定
 * @param button - PointerEvent.button
 */
export const isPrimaryButton = (button: number): boolean => button === PRIMARY_BUTTON

/**
 * pointermove/pointerenter時にプライマリボタンが押されているかを判定
 * @param buttons - PointerEvent.buttons
 */
export const isPrimaryButtonPressed = (buttons: number): boolean =>
  (buttons & PRIMARY_BUTTON_MASK) !== 0
