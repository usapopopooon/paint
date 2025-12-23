import { generateId } from '@/lib/id'
import type { DrawableId } from '../../types'

/**
 * ユニークな描画要素IDを生成
 * @returns 'drawable-'プレフィックス付きのユニークID
 */
export const generateDrawableId = (): DrawableId => generateId('drawable')
