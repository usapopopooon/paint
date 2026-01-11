/** プライマリボタン（左クリック）のボタン値 */
const PRIMARY_BUTTON = 0

/** セカンダリボタン（右クリック）のボタン値 */
const SECONDARY_BUTTON = 2

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

/**
 * pointerdown/pointerup時にセカンダリボタン（右クリック/バレルボタン）が押されたかを判定
 * @param button - PointerEvent.button
 */
export const isSecondaryButton = (button: number): boolean => button === SECONDARY_BUTTON
