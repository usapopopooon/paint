import { useCallback, useMemo, useState } from 'react'
import type { ToolType, ToolConfig, NoneToolConfig, CursorConfig } from '../types'
import { getToolBehavior } from '../domain'
import { createInitialToolState, isDrawingToolType, type ToolState } from '../helpers'
import { DEFAULT_HARDNESS } from '../constants/hardness'

type ConfigKey = 'penConfig' | 'brushConfig' | 'blurConfig' | 'eraserConfig'

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
    setState((prev) => ({
      ...prev,
      currentType: type,
      // 描画ツールを選択した場合は記録
      lastDrawingToolType: isDrawingToolType(type) ? type : prev.lastDrawingToolType,
    }))
  }, [])

  /**
   * ツール状態を一括で設定（プロジェクト復元用）
   * @param newState - 設定するツール状態
   */
  const setFullState = useCallback((newState: ToolState) => {
    setState(newState)
  }, [])

  const setPenWidth = useMemo(() => createConfigSetter<number>(setState, 'penConfig', 'width'), [])
  const setPenColor = useMemo(() => createConfigSetter<string>(setState, 'penConfig', 'color'), [])
  const setPenOpacity = useMemo(
    () => createConfigSetter<number>(setState, 'penConfig', 'opacity'),
    []
  )
  const setPenHardness = useMemo(
    () => createConfigSetter<number>(setState, 'penConfig', 'hardness'),
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
  const setBrushHardness = useMemo(
    () => createConfigSetter<number>(setState, 'brushConfig', 'hardness'),
    []
  )

  const setBlurWidth = useMemo(
    () => createConfigSetter<number>(setState, 'blurConfig', 'width'),
    []
  )
  const setBlurOpacity = useMemo(
    () => createConfigSetter<number>(setState, 'blurConfig', 'opacity'),
    []
  )
  const setBlurHardness = useMemo(
    () => createConfigSetter<number>(setState, 'blurConfig', 'hardness'),
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
  const setEraserHardness = useMemo(
    () => createConfigSetter<number>(setState, 'eraserConfig', 'hardness'),
    []
  )

  const setPenBlurEnabled = useMemo(
    () => createConfigSetter<boolean>(setState, 'penConfig', 'isBlurEnabled'),
    []
  )
  const setBrushBlurEnabled = useMemo(
    () => createConfigSetter<boolean>(setState, 'brushConfig', 'isBlurEnabled'),
    []
  )
  const setEraserBlurEnabled = useMemo(
    () => createConfigSetter<boolean>(setState, 'eraserConfig', 'isBlurEnabled'),
    []
  )

  const noneConfig: NoneToolConfig = { type: 'none' }

  const currentConfig: ToolConfig =
    state.currentType === 'pen'
      ? state.penConfig
      : state.currentType === 'brush'
        ? state.brushConfig
        : state.currentType === 'blur'
          ? state.blurConfig
          : state.currentType === 'eraser'
            ? state.eraserConfig
            : noneConfig

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

  /**
   * 最後に選択された描画ツールのhardness値を取得
   * 非描画ツール選択時にスライダーに表示する値
   */
  const lastDrawingToolHardness = useMemo(() => {
    const lastType = state.lastDrawingToolType
    if (lastType === 'pen') return state.penConfig.hardness
    if (lastType === 'brush') return state.brushConfig.hardness
    if (lastType === 'blur') return state.blurConfig.hardness
    if (lastType === 'eraser') return state.eraserConfig.hardness
    return DEFAULT_HARDNESS
  }, [
    state.lastDrawingToolType,
    state.penConfig.hardness,
    state.brushConfig.hardness,
    state.blurConfig.hardness,
    state.eraserConfig.hardness,
  ])

  /**
   * 最後に選択された描画ツールのisBlurEnabled値を取得
   * 非描画ツール選択時にスイッチに表示する値
   * ぼかしツールは常にぼかし有効なのでtrueを返す
   */
  const lastDrawingToolBlurEnabled = useMemo(() => {
    const lastType = state.lastDrawingToolType
    if (lastType === 'pen') return state.penConfig.isBlurEnabled
    if (lastType === 'brush') return state.brushConfig.isBlurEnabled
    if (lastType === 'blur') return true
    if (lastType === 'eraser') return state.eraserConfig.isBlurEnabled
    return true
  }, [
    state.lastDrawingToolType,
    state.penConfig.isBlurEnabled,
    state.brushConfig.isBlurEnabled,
    state.eraserConfig.isBlurEnabled,
  ])

  return {
    currentType: state.currentType,
    currentConfig,
    penConfig: state.penConfig,
    brushConfig: state.brushConfig,
    blurConfig: state.blurConfig,
    eraserConfig: state.eraserConfig,
    /** ツール状態全体（プロジェクト保存用） */
    toolState: state,
    cursor,
    lastDrawingToolHardness,
    lastDrawingToolBlurEnabled,
    setToolType,
    setFullState,
    setPenWidth,
    setPenColor,
    setPenOpacity,
    setPenHardness,
    setPenBlurEnabled,
    setBrushWidth,
    setBrushColor,
    setBrushOpacity,
    setBrushHardness,
    setBrushBlurEnabled,
    setBlurWidth,
    setBlurOpacity,
    setBlurHardness,
    setEraserWidth,
    setEraserOpacity,
    setEraserHardness,
    setEraserBlurEnabled,
    getCursor,
  } as const
}

export type UseToolReturn = ReturnType<typeof useTool>
