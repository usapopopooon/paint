import { createContext } from 'react'
import type { RendererEngine } from '../renderer'

type RendererContextValue = {
  readonly engineType: RendererEngine
}

export const RendererContext = createContext<RendererContextValue | null>(null)
