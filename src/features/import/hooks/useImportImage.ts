import { useCallback, useRef } from 'react'
import type { ImageDrawable } from '@/features/drawable'
import { createImageDrawable } from '@/features/drawable'
import { validateImageFile, calculateImageSize } from '../helpers'

export type ImportImageResult =
  | {
      success: true
      drawable: ImageDrawable
    }
  | {
      success: false
      error: 'invalid-file-type'
    }

export type UseImportImageOptions = {
  canvasWidth: number
  canvasHeight: number
  onImport: (drawable: ImageDrawable) => void
  onError: (error: 'invalid-file-type') => void
}

/**
 * 画像インポート用のhook
 */
export const useImportImage = ({
  canvasWidth,
  canvasHeight,
  onImport,
  onError,
}: UseImportImageOptions) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  /**
   * ファイル選択ダイアログを開く
   */
  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  /**
   * ファイル選択時の処理
   */
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // 同じファイルを再選択できるようにリセット
      event.target.value = ''

      // ファイル形式を検証
      const isValid = await validateImageFile(file)
      if (!isValid) {
        onError('invalid-file-type')
        return
      }

      // 画像をbase64に変換
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        if (!src) return

        // 画像のサイズを取得
        const img = new Image()
        img.onload = () => {
          const dimensions = calculateImageSize(
            img.naturalWidth,
            img.naturalHeight,
            canvasWidth,
            canvasHeight
          )

          const drawable = createImageDrawable({
            src,
            ...dimensions,
          })

          onImport(drawable)
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    },
    [canvasWidth, canvasHeight, onImport, onError]
  )

  return {
    inputRef,
    openFilePicker,
    handleFileChange,
  } as const
}
