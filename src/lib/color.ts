/**
 * HSV色空間の型定義
 * @property h - 色相 (0-360)
 * @property s - 彩度 (0-100)
 * @property v - 明度 (0-100)
 */
export type HSV = { h: number; s: number; v: number }

/**
 * HSV色空間からHEXカラーコードに変換
 * @param h - 色相 (0-360)
 * @param s - 彩度 (0-100)
 * @param v - 明度 (0-100)
 * @returns HEXカラーコード（例: "#ff0000"）
 */
export const hsvToHex = (h: number, s: number, v: number): string => {
  const sNorm = s / 100
  const vNorm = v / 100
  const c = vNorm * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vNorm - c

  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * HEXカラーコードからHSV色空間に変換
 * @param hex - HEXカラーコード（#付きまたは#なし）
 * @returns HSVオブジェクト。無効な入力の場合はデフォルト値（白）を返す
 */
export const hexToHsv = (hex: string): HSV => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, v: 100 }

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max === min) {
    return { h: 0, s: Math.round(s * 100), v: Math.round(v * 100) }
  }

  const h = (() => {
    switch (max) {
      case r:
        return ((g - b) / d + (g < b ? 6 : 0)) / 6
      case g:
        return ((b - r) / d + 2) / 6
      default:
        return ((r - g) / d + 4) / 6
    }
  })()

  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

/**
 * HEXカラーコードの形式が有効かどうかを検証
 * @param hex - 検証するHEXカラーコード
 * @returns 有効な形式の場合はtrue
 */
export const isValidHex = (hex: string): boolean => {
  return /^#?([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{3})$/i.test(hex)
}

/**
 * HEXカラーコードを正規化（#付き6桁または8桁小文字形式に統一）
 * @param hex - 正規化するHEXカラーコード
 * @returns 正規化されたHEXカラーコード（例: "#ff0000" または "#ff0000ff"）
 */
export const normalizeHex = (hex: string): string => {
  let normalized = hex.startsWith('#') ? hex : `#${hex}`
  // 3桁を6桁に展開
  if (normalized.length === 4) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
  }
  // 4桁を8桁に展開
  if (normalized.length === 5) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}${normalized[4]}${normalized[4]}`
  }
  return normalized.toLowerCase()
}

/**
 * HEXカラーコードを数値に変換
 * @param hex - HEXカラーコード（#付きまたは#なし）
 * @returns 数値カラー（例: 0xff0000）
 */
export const hexToNumber = (hex: string): number => {
  const normalized = normalizeHex(hex)
  return parseInt(normalized.slice(1), 16)
}
