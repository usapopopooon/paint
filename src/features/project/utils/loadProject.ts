import type { z } from 'zod'
import type { ProjectFile } from '../domain'
import { parseProjectFile } from '../domain'
import { PROJECT_FILE_VERSION } from '../constants'

export type LoadProjectError =
  | { readonly type: 'parse_error' }
  | { readonly type: 'invalid_format'; readonly zodError: z.ZodError }
  | { readonly type: 'unsupported_version'; readonly fileVersion: number }

export type LoadProjectResult =
  | {
      readonly success: true
      readonly project: ProjectFile
    }
  | {
      readonly success: false
      readonly error: LoadProjectError
    }

/**
 * プロジェクトファイルを読み込み・バリデーション
 */
export const loadProject = async (file: File): Promise<LoadProjectResult> => {
  // JSONパース
  let data: unknown
  try {
    const text = await file.text()
    data = JSON.parse(text)
  } catch {
    return { success: false, error: { type: 'parse_error' } }
  }

  // Zodバリデーション
  const result = parseProjectFile(data)
  if (!result.success) {
    return {
      success: false,
      error: { type: 'invalid_format', zodError: result.error },
    }
  }

  // バージョンチェック
  if (result.data.version > PROJECT_FILE_VERSION) {
    return {
      success: false,
      error: { type: 'unsupported_version', fileVersion: result.data.version },
    }
  }

  return { success: true, project: result.data }
}
