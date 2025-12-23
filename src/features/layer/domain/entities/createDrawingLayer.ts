import { generateId } from '@/lib/id'
import type { Layer } from '../../types'

/**
 * 描画レイヤーを作成
 * @param id - レイヤーID（省略時は自動生成）
 * @param name - レイヤー名（省略時は'Layer 1'）
 * @returns 新しい描画レイヤー
 */
export const createDrawingLayer = (id?: string, name?: string): Layer => ({
  id: id ?? generateId('layer'),
  name: name ?? 'Layer 1',
  type: 'drawing',
  visible: true,
  locked: false,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})
