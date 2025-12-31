import { UAParser } from 'ua-parser-js'

const result = UAParser()
const os = result.os

/**
 * 現在のプラットフォームがMacかどうか
 */
export const isMac = os.name === 'Mac OS'

/**
 * 現在のプラットフォームがWindowsかどうか
 */
export const isWindows = os.name === 'Windows'

/**
 * 修飾キーの表示名を取得
 * MacならCmd (⌘)、その他ならCtrl
 */
export const getModifierKey = (): string => (isMac ? '⌘' : 'Ctrl')
