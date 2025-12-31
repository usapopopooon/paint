import { describe, test, expect, vi } from 'vitest'
import { validateImageFile } from './validateImageFile'

// file-typeをモック
vi.mock('file-type', () => ({
  fileTypeFromBuffer: vi.fn(),
}))

import { fileTypeFromBuffer } from 'file-type'

describe('validateImageFile', () => {
  const createMockFile = (): File => {
    const content = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) // PNG header
    const file = new File([content], 'test.png', { type: 'application/octet-stream' })
    // happy-domのFileはarrayBufferを持たないため追加
    if (!file.arrayBuffer) {
      Object.defineProperty(file, 'arrayBuffer', {
        value: async () => content.buffer,
      })
    }
    return file
  }

  test('PNG形式の場合はtrueを返す', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'png', mime: 'image/png' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(true)
  })

  test('JPEG形式の場合はtrueを返す', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'jpg', mime: 'image/jpeg' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(true)
  })

  test('GIF形式の場合はtrueを返す', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'gif', mime: 'image/gif' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(true)
  })

  test('WebP形式の場合はtrueを返す', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'webp', mime: 'image/webp' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(true)
  })

  test('対応していない形式の場合はfalseを返す', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(false)
  })

  test('ファイルタイプが検出できない場合はfalseを返す', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue(undefined)

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(false)
  })

  test('BMP形式は対応していない', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'bmp', mime: 'image/bmp' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(false)
  })

  test('SVG形式は対応していない', async () => {
    vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: 'svg', mime: 'image/svg+xml' })

    const file = createMockFile()
    const result = await validateImageFile(file)

    expect(result).toBe(false)
  })
})
