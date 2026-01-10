import type { DrawableId, ImageDrawable } from '../../types'
import { generateDrawableId } from './generateDrawableId'

export type CreateImageDrawableParams = {
  src: string
  x: number
  y: number
  width: number
  height: number
  scaleX?: number
  scaleY?: number
}

/**
 * ImageDrawableを作成
 * @param params - 画像の配置パラメータ
 * @param id - オプションのID（指定しない場合は自動生成）
 * @returns 新しいImageDrawableオブジェクト
 */
export const createImageDrawable = (
  params: CreateImageDrawableParams,
  id?: DrawableId
): ImageDrawable => ({
  id: id ?? generateDrawableId(),
  createdAt: Date.now(),
  type: 'image',
  src: params.src,
  x: params.x,
  y: params.y,
  width: params.width,
  height: params.height,
  scaleX: params.scaleX ?? 1,
  scaleY: params.scaleY ?? 1,
})
