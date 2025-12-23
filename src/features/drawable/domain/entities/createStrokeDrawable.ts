import type { StrokeStyle } from '@/features/brush'
import type { Point } from '@/lib/geometry'
import type { DrawableId, StrokeDrawable } from '../../types'
import { generateDrawableId } from './generateDrawableId'

/**
 * StrokeDrawableを作成
 * @param points - ストロークを構成するポイントの配列
 * @param style - ストロークのスタイル設定
 * @param id - オプションのID（指定しない場合は自動生成）
 * @returns 新しいStrokeDrawableオブジェクト
 */
export const createStrokeDrawable = (
  points: readonly Point[],
  style: StrokeStyle,
  id?: DrawableId
): StrokeDrawable => ({
  id: id ?? generateDrawableId(),
  createdAt: Date.now(),
  type: 'stroke',
  points,
  style,
})
