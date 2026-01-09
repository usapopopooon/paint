import type { ReactNode } from 'react'
import type { RendererEngine } from '../renderer'
import { RendererContext } from './rendererContextValue'

type RendererProviderProps = {
  readonly engineType: RendererEngine
  readonly children: ReactNode
}

/**
 * レンダラーエンジンタイプを提供するProvider
 */
export const RendererProvider = ({ engineType, children }: RendererProviderProps) => {
  return <RendererContext.Provider value={{ engineType }}>{children}</RendererContext.Provider>
}
