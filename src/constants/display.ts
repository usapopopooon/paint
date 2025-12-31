/**
 * 表示倍率変換用定数
 *
 * 内部では高解像度（実際のピクセル数）で処理し、
 * UIでは見かけ上のサイズ（内部値の1/2）として表示する。
 *
 * 例:
 * - 内部キャンバスサイズ 1600x1600 → UI表示 800x800
 * - 内部ズーム 50% → UI表示 100%
 * - 内部ペンサイズ 10px → UI表示 5px
 */
export const DISPLAY_MULTIPLIER = 2

/**
 * 内部値からUI表示値への変換率（エクスポート時の縮小率）
 * DISPLAY_MULTIPLIER の逆数
 */
export const DISPLAY_SCALE = 1 / DISPLAY_MULTIPLIER
