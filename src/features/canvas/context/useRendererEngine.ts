import { useContext } from 'react'
import type { RendererEngine } from '../renderer'
import { RendererContext } from './rendererContextValue'

/**
 * 現在のレンダラーエンジンタイプを取得するフック
 * Provider外で使用された場合はデフォルト値を返す
 */
export const useRendererEngine = (): RendererEngine => {
  const context = useContext(RendererContext)
  return context?.engineType ?? 'canvas'
}

/**
 * 現在のレンダラーがPixiJSかどうかを返すフック
 */
export const useIsPixiEngine = (): boolean => {
  return useRendererEngine() === 'pixi'
}
