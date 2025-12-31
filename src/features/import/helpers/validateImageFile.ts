import { fileTypeFromBuffer } from 'file-type'

/** 対応している画像MIME types */
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number]

/**
 * ファイルが対応している画像形式かを検証
 * file-typeライブラリを使用してバイナリヘッダーを検査
 * @param file - 検証するファイル
 * @returns 対応形式の場合はtrue
 */
export const validateImageFile = async (file: File): Promise<boolean> => {
  const buffer = await file.arrayBuffer()
  const type = await fileTypeFromBuffer(buffer)

  if (!type) {
    return false
  }

  return SUPPORTED_IMAGE_TYPES.includes(type.mime as SupportedImageType)
}
