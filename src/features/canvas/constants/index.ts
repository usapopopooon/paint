// グローバル定数を再エクスポート
export {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  MIN_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
} from '@/constants/canvas'
export { MIN_ZOOM, MAX_ZOOM } from '@/constants/zoom'

/** 透明とみなすアルファ値のしきい値 */
export const TRANSPARENT_THRESHOLD = 10

/**
 * スポイトツール用のカーソル（SVG data URL）
 * lucide-reactのPipetteアイコンをベースに作成
 */
export const EYEDROPPER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 22 1-1h3l9-9'/%3E%3Cpath d='M3 21v-3l9-9'/%3E%3Cpath d='m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z'/%3E%3C/svg%3E") 0 24, crosshair`
