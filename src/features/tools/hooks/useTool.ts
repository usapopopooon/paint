import { useCallback, useState } from 'react'
import type { ToolType, ToolConfig, PenToolConfig, EraserToolConfig, CursorConfig } from '../types'
import { penBehavior, eraserBehavior } from '../behaviors'
import { getToolBehavior } from '../registry'

export type ToolState = {
  readonly currentType: ToolType
  readonly penConfig: PenToolConfig
  readonly eraserConfig: EraserToolConfig
}

const createInitialState = (): ToolState => ({
  currentType: 'pen',
  penConfig: penBehavior.defaultConfig(),
  eraserConfig: eraserBehavior.defaultConfig(),
})

export const useTool = () => {
  const [state, setState] = useState<ToolState>(createInitialState)

  const setToolType = useCallback((type: ToolType) => {
    setState((prev) => ({ ...prev, currentType: type }))
  }, [])

  const setPenWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, penConfig: { ...prev.penConfig, width } }))
  }, [])

  const setPenColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, penConfig: { ...prev.penConfig, color } }))
  }, [])

  const setEraserWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, eraserConfig: { ...prev.eraserConfig, width } }))
  }, [])

  const currentConfig: ToolConfig =
    state.currentType === 'pen' ? state.penConfig : state.eraserConfig

  const getCursor = useCallback(
    (backgroundColor: string): CursorConfig => {
      const behavior = getToolBehavior(state.currentType)
      return behavior.getCursor(currentConfig, backgroundColor)
    },
    [state.currentType, currentConfig]
  )

  return {
    currentType: state.currentType,
    currentConfig,
    penConfig: state.penConfig,
    eraserConfig: state.eraserConfig,
    setToolType,
    setPenWidth,
    setPenColor,
    setEraserWidth,
    getCursor,
  } as const
}
