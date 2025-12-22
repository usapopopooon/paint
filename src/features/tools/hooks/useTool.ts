import { useCallback, useState } from 'react'
import type { ToolType, ToolConfig, PenToolConfig, EraserToolConfig, CursorConfig } from '../types'
import { penBehavior, eraserBehavior } from '../behaviors'
import { getToolBehavior } from '../registry'

/**
 * ツール状態の型
 */
export type ToolState = {
  readonly currentType: ToolType
  readonly penConfig: PenToolConfig
  readonly eraserConfig: EraserToolConfig
}

/**
 * ツールの初期状態を作成
 * @returns 初期ToolState
 */
const createInitialState = (): ToolState => ({
  currentType: 'pen',
  penConfig: penBehavior.defaultConfig(),
  eraserConfig: eraserBehavior.defaultConfig(),
})

/**
 * ツール状態を管理するフック
 * @returns ツール操作用のメソッドと現在の状態
 */
export const useTool = () => {
  const [state, setState] = useState<ToolState>(createInitialState)

  /**
   * ツールタイプを切り替え
   * @param type - 切り替え先のツールタイプ
   */
  const setToolType = useCallback((type: ToolType) => {
    setState((prev) => ({ ...prev, currentType: type }))
  }, [])

  /**
   * ペンの幅を設定
   * @param width - ペンの幅（ピクセル）
   */
  const setPenWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, penConfig: { ...prev.penConfig, width } }))
  }, [])

  /**
   * ペンの色を設定
   * @param color - ペンの色（CSS色文字列）
   */
  const setPenColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, penConfig: { ...prev.penConfig, color } }))
  }, [])

  /**
   * 消しゴムの幅を設定
   * @param width - 消しゴムの幅（ピクセル）
   */
  const setEraserWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, eraserConfig: { ...prev.eraserConfig, width } }))
  }, [])

  const currentConfig: ToolConfig =
    state.currentType === 'pen' ? state.penConfig : state.eraserConfig

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
