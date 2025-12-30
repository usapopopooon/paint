import type { BLEND_MODES } from 'pixi.js'
import type { LayerBlendMode } from '../../types'

/**
 * LayerBlendModeをPixiJSのブレンドモードにマッピング
 * @param mode - レイヤーブレンドモード
 * @returns 対応するPixiJSのBLEND_MODES値
 */
export const blendModeToPixi = (mode: LayerBlendMode): BLEND_MODES => {
  const map: Record<LayerBlendMode, BLEND_MODES> = {
    normal: 'normal',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
  }
  return map[mode]
}
