/** 画像フォーマット */
export type ImageFormat = 'jpg' | 'png'

/** 出力スケール */
export type ExportScale = '100' | '50' | '25'

/** エクスポートオプション */
export type ExportOptions = {
  /** ファイル名（拡張子なし） */
  readonly fileName: string
  /** 画像フォーマット */
  readonly format: ImageFormat
  /** 出力スケール（パーセント） */
  readonly scale: ExportScale
  /** 背景を含めるか（PNGのみ） */
  readonly includeBackground: boolean
  /** JPEG品質（0-100）- JPGのみ */
  readonly jpegQuality: number
}

/** スケールの数値変換 */
export const SCALE_VALUES: Record<ExportScale, number> = {
  '100': 1.0,
  '50': 0.5,
  '25': 0.25,
}

/** デフォルトのJPEG品質 */
export const DEFAULT_JPEG_QUALITY = 92

/** JPEG品質の最小値 */
export const MIN_JPEG_QUALITY = 1

/** JPEG品質の最大値 */
export const MAX_JPEG_QUALITY = 100
