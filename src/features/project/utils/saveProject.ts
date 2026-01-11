import type { Layer } from '@/features/layer'
import type { ProjectFile, ProjectToolState } from '../domain'
import { PROJECT_FILE_VERSION, PROJECT_FILE_EXTENSION, PROJECT_MIME_TYPE } from '../constants'

export type SaveProjectOptions = {
  readonly fileName: string
  readonly canvasWidth: number
  readonly canvasHeight: number
  readonly layers: readonly Layer[]
  readonly activeLayerId: string
  readonly toolState?: ProjectToolState
}

/**
 * プロジェクトファイルを作成
 */
export const createProjectFile = (options: SaveProjectOptions): ProjectFile => {
  const now = Date.now()
  return {
    version: PROJECT_FILE_VERSION,
    name: options.fileName,
    canvasWidth: options.canvasWidth,
    canvasHeight: options.canvasHeight,
    layers: options.layers,
    activeLayerId: options.activeLayerId,
    createdAt: now,
    updatedAt: now,
    toolState: options.toolState,
  }
}

/**
 * File System Access APIがサポートされているかチェック
 */
export const isFileSystemAccessSupported = (): boolean => {
  return 'showSaveFilePicker' in window
}

/**
 * File System Access APIを使用してファイルを保存
 */
const saveWithFileSystemAccess = async (content: string, fileName: string): Promise<boolean> => {
  try {
    const handle = await window.showSaveFilePicker!({
      suggestedName: `${fileName}${PROJECT_FILE_EXTENSION}`,
      types: [
        {
          description: 'Usapo Project File',
          accept: { [PROJECT_MIME_TYPE]: [PROJECT_FILE_EXTENSION] },
        },
      ],
    })
    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
    return true
  } catch (error) {
    // ユーザーがキャンセルした場合
    if (error instanceof Error && error.name === 'AbortError') {
      return false
    }
    throw error
  }
}

/**
 * ダウンロードリンクを使用してファイルを保存（フォールバック）
 */
const saveWithDownload = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: PROJECT_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}${PROJECT_FILE_EXTENSION}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * プロジェクトを保存
 * @returns 保存に成功した場合true、キャンセルされた場合false
 */
export const saveProject = async (options: SaveProjectOptions): Promise<boolean> => {
  const projectFile = createProjectFile(options)
  const content = JSON.stringify(projectFile, null, 2)

  if (isFileSystemAccessSupported()) {
    return saveWithFileSystemAccess(content, options.fileName)
  } else {
    saveWithDownload(content, options.fileName)
    return true
  }
}
