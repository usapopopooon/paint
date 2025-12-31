/** カラーホイールのサイズ（ピクセル） */
export const WHEEL_SIZE = 200
/** 色相リングの幅（ピクセル） */
export const RING_WIDTH = 16
/** 彩度・明度選択の正方形の余白（ピクセル） */
const SQUARE_MARGIN = 4
/** 彩度・明度選択の正方形サイズ（ピクセル） */
export const SQUARE_SIZE = (WHEEL_SIZE / 2 - RING_WIDTH) * Math.sqrt(2) - SQUARE_MARGIN
