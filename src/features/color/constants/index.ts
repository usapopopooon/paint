/** カラーホイールのサイズ（ピクセル） */
export const WHEEL_SIZE = 200
/** 色相リングの幅（ピクセル） */
export const RING_WIDTH = 16
/** 彩度・明度選択の正方形の余白（ピクセル） */
const SQUARE_MARGIN = 4
/** 彩度・明度選択の正方形サイズ（ピクセル） */
export const SQUARE_SIZE = (WHEEL_SIZE / 2 - RING_WIDTH) * Math.sqrt(2) - SQUARE_MARGIN

/** HSV値の最小値（パーセンテージ） */
export const HSV_MIN = 0
/** HSV値の最大値（パーセンテージ） */
export const HSV_MAX = 100
/** 角度変換: ラジアンから度への係数 */
export const RADIANS_TO_DEGREES = 180 / Math.PI
/** 角度変換: 度からラジアンへの係数 */
export const DEGREES_TO_RADIANS = Math.PI / 180
/** 円の全周（度） */
export const FULL_CIRCLE_DEGREES = 360
/** 色相の開始オフセット角度（上方向を0度とするため） */
export const HUE_ANGLE_OFFSET = 90
/** クリック判定の拡張パディング（ピクセル） */
export const CLICK_PADDING = 8
/** キーボード操作のステップ値 */
export const KEYBOARD_STEP = 1
/** Shift押下時のキーボード操作のステップ値 */
export const KEYBOARD_STEP_LARGE = 10
