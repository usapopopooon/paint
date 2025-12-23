import type { LayerBlendMode } from '../../types'

/**
 * LayerBlendModeをCanvas 2DのglobalCompositeOperationにマッピング
 * @param mode - レイヤーブレンドモード
 * @returns 対応するCanvas 2DのglobalCompositeOperation値
 */
export const blendModeToCompositeOp = (mode: LayerBlendMode): GlobalCompositeOperation => {
  const map: Record<LayerBlendMode, GlobalCompositeOperation> = {
    normal: 'source-over',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
  }
  return map[mode]
}
