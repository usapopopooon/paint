import { describe, test, expect } from 'vitest'
import { loadProject } from './loadProject'

// カスタムFileクラス（textメソッドを持つ）
class MockFile {
  private content: string
  name: string
  type: string

  constructor(content: string, name = 'test.usapo') {
    this.content = content
    this.name = name
    this.type = 'application/json'
  }

  async text(): Promise<string> {
    return this.content
  }
}

describe('loadProject', () => {
  const validProjectData = {
    version: 1,
    name: 'test-project',
    canvasWidth: 800,
    canvasHeight: 600,
    layers: [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
        drawables: [],
      },
    ],
    activeLayerId: 'layer-1',
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  }

  const createFile = (content: string, name = 'test.usapo'): File => {
    return new MockFile(content, name) as unknown as File
  }

  describe('読み込み成功', () => {
    test('有効なプロジェクトファイルを読み込む', async () => {
      const file = createFile(JSON.stringify(validProjectData))
      const result = await loadProject(file)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.project.name).toBe('test-project')
        expect(result.project.canvasWidth).toBe(800)
        expect(result.project.canvasHeight).toBe(600)
        expect(result.project.layers).toHaveLength(1)
      }
    })

    test('Drawableを含むプロジェクトを読み込む', async () => {
      const projectWithDrawables = {
        ...validProjectData,
        layers: [
          {
            ...validProjectData.layers[0],
            drawables: [
              {
                id: 'stroke-1',
                createdAt: 1704067200000,
                type: 'stroke',
                points: [{ x: 0, y: 0, pressure: 0.5 }],
                style: {
                  color: '#000000',
                  brushTip: {
                    type: 'solid',
                    size: 5,
                    hardness: 1,
                    opacity: 1,
                  },
                  blendMode: 'normal',
                },
              },
            ],
          },
        ],
      }
      const file = createFile(JSON.stringify(projectWithDrawables))
      const result = await loadProject(file)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.project.layers[0].drawables).toHaveLength(1)
      }
    })
  })

  describe('パースエラー', () => {
    test('無効なJSONの場合はparse_errorを返す', async () => {
      const file = createFile('not valid json {{{')
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('parse_error')
      }
    })

    test('空ファイルの場合はparse_errorを返す', async () => {
      const file = createFile('')
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('parse_error')
      }
    })
  })

  describe('バリデーションエラー', () => {
    test('必須フィールドが欠けている場合はinvalid_formatを返す', async () => {
      const invalidData = {
        version: 1,
        // missing other required fields
      }
      const file = createFile(JSON.stringify(invalidData))
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('invalid_format')
        if (result.error.type === 'invalid_format') {
          expect(result.error.zodError.issues.length).toBeGreaterThan(0)
        }
      }
    })

    test('無効なレイヤー構造の場合はinvalid_formatを返す', async () => {
      const invalidData = {
        ...validProjectData,
        layers: [{ id: 'layer-1' }], // missing required layer fields
      }
      const file = createFile(JSON.stringify(invalidData))
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('invalid_format')
      }
    })

    test('無効なブレンドモードの場合はinvalid_formatを返す', async () => {
      const invalidData = {
        ...validProjectData,
        layers: [
          {
            ...validProjectData.layers[0],
            blendMode: 'invalid-mode',
          },
        ],
      }
      const file = createFile(JSON.stringify(invalidData))
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('invalid_format')
      }
    })

    test('空のlayers配列の場合はinvalid_formatを返す', async () => {
      const invalidData = {
        ...validProjectData,
        layers: [],
      }
      const file = createFile(JSON.stringify(invalidData))
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('invalid_format')
      }
    })
  })

  describe('バージョンエラー', () => {
    test('新しいバージョンの場合はunsupported_versionを返す', async () => {
      const futureVersionData = {
        ...validProjectData,
        version: 999,
      }
      const file = createFile(JSON.stringify(futureVersionData))
      const result = await loadProject(file)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('unsupported_version')
        if (result.error.type === 'unsupported_version') {
          expect(result.error.fileVersion).toBe(999)
        }
      }
    })

    test('現在のバージョンを受け入れる', async () => {
      const file = createFile(JSON.stringify(validProjectData))
      const result = await loadProject(file)

      expect(result.success).toBe(true)
    })
  })
})
