import { useCallback, useRef, useEffect } from 'react'
import type { UseToolReturn } from '@/features/tools'
import { MIN_PEN_WIDTH, MAX_PEN_WIDTH } from '@/features/tools/constants/pen'
import { MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH } from '@/features/tools/constants/brush'
import { MIN_BLUR_WIDTH, MAX_BLUR_WIDTH } from '@/features/tools/constants/blur'
import { MIN_ERASER_WIDTH, MAX_ERASER_WIDTH } from '@/features/tools/constants/eraser'
import { getNextLogValue } from '@/lib/getNextLogValue'

export interface UseToolHandlersOptions {
  tool: UseToolReturn
}

export interface ToolHandlers {
  handleSelectPen: () => void
  handleSelectBrush: () => void
  handleSelectBlur: () => void
  handleSelectEraser: () => void
  handleIncreaseToolSize: () => void
  handleDecreaseToolSize: () => void
  handleColorChange: (color: string) => void
  handleHardnessChange: (hardness: number) => void
  handleBlurEnabledChange: (enabled: boolean) => void
  currentColor: string
  currentHardness: number
  currentBlurEnabled: boolean
  isHardnessDisabled: boolean
}

export function useToolHandlers(options: UseToolHandlersOptions): ToolHandlers {
  const { tool } = options

  // toolの最新状態をrefで保持（useCallbackの依存配列問題を回避）
  const toolRef = useRef(tool)
  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  const handleSelectPen = useCallback(() => {
    tool.setToolType('pen')
  }, [tool])

  const handleSelectBrush = useCallback(() => {
    tool.setToolType('brush')
  }, [tool])

  const handleSelectBlur = useCallback(() => {
    tool.setToolType('blur')
  }, [tool])

  const handleSelectEraser = useCallback(() => {
    tool.setToolType('eraser')
  }, [tool])

  /**
   * ツールサイズを1段階大きくする（対数スケール）
   */
  const handleIncreaseToolSize = useCallback(() => {
    const t = toolRef.current
    const toolType = t.currentType
    const configs = {
      pen: {
        width: t.penConfig.width,
        min: MIN_PEN_WIDTH,
        max: MAX_PEN_WIDTH,
        setter: t.setPenWidth,
      },
      brush: {
        width: t.brushConfig.width,
        min: MIN_BRUSH_WIDTH,
        max: MAX_BRUSH_WIDTH,
        setter: t.setBrushWidth,
      },
      blur: {
        width: t.blurConfig.width,
        min: MIN_BLUR_WIDTH,
        max: MAX_BLUR_WIDTH,
        setter: t.setBlurWidth,
      },
      eraser: {
        width: t.eraserConfig.width,
        min: MIN_ERASER_WIDTH,
        max: MAX_ERASER_WIDTH,
        setter: t.setEraserWidth,
      },
    }
    const config = configs[toolType as keyof typeof configs]
    if (config) {
      const newWidth = getNextLogValue(config.width, config.min, config.max, 1)
      config.setter(newWidth)
    }
  }, [])

  /**
   * ツールサイズを1段階小さくする（対数スケール）
   */
  const handleDecreaseToolSize = useCallback(() => {
    const t = toolRef.current
    const toolType = t.currentType
    const configs = {
      pen: {
        width: t.penConfig.width,
        min: MIN_PEN_WIDTH,
        max: MAX_PEN_WIDTH,
        setter: t.setPenWidth,
      },
      brush: {
        width: t.brushConfig.width,
        min: MIN_BRUSH_WIDTH,
        max: MAX_BRUSH_WIDTH,
        setter: t.setBrushWidth,
      },
      blur: {
        width: t.blurConfig.width,
        min: MIN_BLUR_WIDTH,
        max: MAX_BLUR_WIDTH,
        setter: t.setBlurWidth,
      },
      eraser: {
        width: t.eraserConfig.width,
        min: MIN_ERASER_WIDTH,
        max: MAX_ERASER_WIDTH,
        setter: t.setEraserWidth,
      },
    }
    const config = configs[toolType as keyof typeof configs]
    if (config) {
      const newWidth = getNextLogValue(config.width, config.min, config.max, -1)
      config.setter(newWidth)
    }
  }, [])

  /**
   * 色変更ハンドラ（ペンとブラシの両方に適用）
   */
  const handleColorChange = useCallback(
    (color: string) => {
      tool.setPenColor(color)
      tool.setBrushColor(color)
    },
    [tool]
  )

  /**
   * 現在選択中のツールに応じた色を取得
   */
  const currentColor = tool.currentType === 'brush' ? tool.brushConfig.color : tool.penConfig.color

  /**
   * 現在選択中のツールのhardnessを取得
   */
  const currentHardness =
    tool.currentType === 'pen'
      ? tool.penConfig.hardness
      : tool.currentType === 'brush'
        ? tool.brushConfig.hardness
        : tool.currentType === 'blur'
          ? tool.blurConfig.hardness
          : tool.currentType === 'eraser'
            ? tool.eraserConfig.hardness
            : tool.lastDrawingToolHardness

  /**
   * 現在選択中のツールのisBlurEnabledを取得
   */
  const currentBlurEnabled =
    tool.currentType === 'pen'
      ? tool.penConfig.isBlurEnabled
      : tool.currentType === 'brush'
        ? tool.brushConfig.isBlurEnabled
        : tool.currentType === 'eraser'
          ? tool.eraserConfig.isBlurEnabled
          : tool.lastDrawingToolBlurEnabled

  /**
   * 現在選択中のツールのhardnessを変更
   */
  const handleHardnessChange = useCallback(
    (hardness: number) => {
      const setters = {
        pen: tool.setPenHardness,
        brush: tool.setBrushHardness,
        blur: tool.setBlurHardness,
        eraser: tool.setEraserHardness,
      }
      const setter = setters[tool.currentType as keyof typeof setters]
      if (setter) setter(hardness)
    },
    [tool]
  )

  /**
   * 現在選択中のツールのisBlurEnabledを変更
   */
  const handleBlurEnabledChange = useCallback(
    (enabled: boolean) => {
      const setters = {
        pen: tool.setPenBlurEnabled,
        brush: tool.setBrushBlurEnabled,
        eraser: tool.setEraserBlurEnabled,
      }
      const setter = setters[tool.currentType as keyof typeof setters]
      if (setter) setter(enabled)
    },
    [tool]
  )

  /**
   * hardnessスライダーが無効かどうか（ペン、ブラシ、ぼかし、消しゴム以外）
   */
  const isHardnessDisabled = !['pen', 'brush', 'blur', 'eraser'].includes(tool.currentType)

  return {
    handleSelectPen,
    handleSelectBrush,
    handleSelectBlur,
    handleSelectEraser,
    handleIncreaseToolSize,
    handleDecreaseToolSize,
    handleColorChange,
    handleHardnessChange,
    handleBlurEnabledChange,
    currentColor,
    currentHardness,
    currentBlurEnabled,
    isHardnessDisabled,
  }
}
