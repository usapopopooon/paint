/**
 * ストロークを描画・保存するために必要な最小ポイント数
 * 1点のみでは線を描画できないため、2点以上必要
 */
export const MIN_STROKE_POINTS = 2

/**
 * ストロークが描画可能な最小ポイント数を持っているかを判定
 * @param pointsLength - ストロークのポイント数
 * @returns 描画可能な場合はtrue
 */
export const hasMinimumPoints = (pointsLength: number): boolean => pointsLength >= MIN_STROKE_POINTS
