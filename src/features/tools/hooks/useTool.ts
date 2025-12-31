import { useCallback, useMemo, useState } from 'react'
import type { ToolType, ToolConfig, HandToolConfig, CursorConfig } from '../types'
import { getToolBehavior } from '../domain'
import { createInitialToolState, type ToolState } from '../helpers'

type ConfigKey = 'penConfig' | 'brushConfig' | 'eraserConfig'

/**
 * 指定されたツール設定のプロパティを更新するセッターを作成
 */
const createConfigSetter = <T>(
  setState: React.Dispatch<React.SetStateAction<ToolState>>,
  configKey: ConfigKey,
  property: string
) => {
  return (value: T) => {
    setState((prev) => ({
      ...prev,
      [configKey]: { ...prev[configKey], [property]: value },
    }))
  }
}

/**
 * ツール状態を管理するフック
 * @returns ツール操作用のメソッドと現在の状態
 */
export const useTool = () => {
  const [state, setState] = useState<ToolState>(createInitialToolState)

  /**
   * ツールタイプを切り替え
   * @param type - 切り替え先のツールタイプ
   */
  const setToolType = useCallback((type: ToolType) => {
    setState((prev) => ({ ...prev, currentType: type }))
  }, [])

  const setPenWidth = useMemo(() => createConfigSetter<number>(setState, 'penConfig', 'width'), [])
  const setPenColor = useMemo(() => createConfigSetter<string>(setState, 'penConfig', 'color'), [])
  const setPenOpacity = useMemo(
    () => createConfigSetter<number>(setState, 'penConfig', 'opacity'),
    []
  )

  const setBrushWidth = useMemo(
    () => createConfigSetter<number>(setState, 'brushConfig', 'width'),
    []
  )
  const setBrushColor = useMemo(
    () => createConfigSetter<string>(setState, 'brushConfig', 'color'),
    []
  )
  const setBrushOpacity = useMemo(
    () => createConfigSetter<number>(setState, 'brushConfig', 'opacity'),
    []
  )

  const setEraserWidth = useMemo(
    () => createConfigSetter<number>(setState, 'eraserConfig', 'width'),
    []
  )
  const setEraserOpacity = useMemo(
    () => createConfigSetter<number>(setState, 'eraserConfig', 'opacity'),
    []
  )

  const handConfig: HandToolConfig = { type: 'hand' }

  const currentConfig: ToolConfig =
    state.currentType === 'pen'
      ? state.penConfig
      : state.currentType === 'brush'
        ? state.brushConfig
        : state.currentType === 'eraser'
          ? state.eraserConfig
          : handConfig

  /**
   * カーソル設定を取得
   * @param backgroundColor - 背景色（カーソルの色決定に使用）
   * @returns カーソル設定
   */
  const getCursor = useCallback(
    (backgroundColor: string): CursorConfig => {
      const behavior = getToolBehavior(state.currentType)
      return behavior.getCursor(currentConfig, backgroundColor)
    },
    [state.currentType, currentConfig]
  )

  /** 現在のツール設定に基づくカーソル設定（白背景想定） */
  const cursor = useMemo<CursorConfig>(() => getCursor('#ffffff'), [getCursor])

  return {
    currentType: state.currentType,
    currentConfig,
    penConfig: state.penConfig,
    brushConfig: state.brushConfig,
    eraserConfig: state.eraserConfig,
    cursor,
    setToolType,
    setPenWidth,
    setPenColor,
    setPenOpacity,
    setBrushWidth,
    setBrushColor,
    setBrushOpacity,
    setEraserWidth,
    setEraserOpacity,
    getCursor,
  } as const
}
