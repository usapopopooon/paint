import { useCallback, useMemo, useState } from 'react'
import type { ToolType, ToolConfig, HandToolConfig, CursorConfig } from '../types'
import { MIN_PEN_WIDTH, MAX_PEN_WIDTH, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH } from '../types'
import { getToolBehavior } from '../domain'
import { valueToSlider, sliderToValue } from '@/lib/slider'
import { createInitialToolState, type ToolState } from '../helpers'

/** ホイールでブラシサイズを調整する際のスライダー値のステップ */
const BRUSH_SIZE_SLIDER_STEP = 5
/** スライダーの最小値 */
const SLIDER_MIN = 0
/** スライダーの最大値 */
const SLIDER_MAX = 100

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

  const handConfig: HandToolConfig = { type: 'hand' }

  const currentConfig: ToolConfig =
    state.currentType === 'pen'
      ? state.penConfig
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

  /**
   * ホイールでブラシサイズを調整
   * @param deltaY - ホイールのスクロール量（正で縮小、負で拡大）
   */
  const adjustBrushSize = useCallback(
    (deltaY: number) => {
      const step = deltaY > 0 ? -BRUSH_SIZE_SLIDER_STEP : BRUSH_SIZE_SLIDER_STEP
      if (state.currentType === 'pen') {
        const currentSlider = valueToSlider(state.penConfig.width, MIN_PEN_WIDTH, MAX_PEN_WIDTH)
        const newSlider = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, currentSlider + step))
        const newWidth = sliderToValue(newSlider, MIN_PEN_WIDTH, MAX_PEN_WIDTH)
        setPenWidth(newWidth)
      } else {
        const currentSlider = valueToSlider(
          state.eraserConfig.width,
          MIN_ERASER_WIDTH,
          MAX_ERASER_WIDTH
        )
        const newSlider = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, currentSlider + step))
        const newWidth = sliderToValue(newSlider, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)
        setEraserWidth(newWidth)
      }
    },
    [
      state.currentType,
      state.penConfig.width,
      state.eraserConfig.width,
      setPenWidth,
      setEraserWidth,
    ]
  )

  /** 現在のツール設定に基づくカーソル設定（白背景想定） */
  const cursor = useMemo<CursorConfig>(() => getCursor('#ffffff'), [getCursor])

  return {
    currentType: state.currentType,
    currentConfig,
    penConfig: state.penConfig,
    eraserConfig: state.eraserConfig,
    cursor,
    setToolType,
    setPenWidth,
    setPenColor,
    setEraserWidth,
    getCursor,
    adjustBrushSize,
  } as const
}
