import { describe, test, expect } from 'vitest'
import { parseProjectFile, projectFileSchema } from './projectSchema'

describe('projectFileSchema', () => {
  const validProject = {
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

  describe('parseProjectFile', () => {
    test('有効なプロジェクトファイルをパースする', () => {
      const result = parseProjectFile(validProject)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('test-project')
        expect(result.data.canvasWidth).toBe(800)
        expect(result.data.layers).toHaveLength(1)
      }
    })

    test('ストロークDrawableを含むプロジェクトをパースする', () => {
      const projectWithStroke = {
        ...validProject,
        layers: [
          {
            ...validProject.layers[0],
            drawables: [
              {
                id: 'stroke-1',
                createdAt: 1704067200000,
                type: 'stroke',
                points: [
                  { x: 0, y: 0, pressure: 0.5 },
                  { x: 10, y: 10, pressure: 0.8 },
                ],
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

      const result = parseProjectFile(projectWithStroke)
      expect(result.success).toBe(true)
    })

    test('画像Drawableを含むプロジェクトをパースする', () => {
      const projectWithImage = {
        ...validProject,
        layers: [
          {
            ...validProject.layers[0],
            drawables: [
              {
                id: 'image-1',
                createdAt: 1704067200000,
                type: 'image',
                src: 'data:image/png;base64,abc123',
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                scaleX: 1,
                scaleY: 1,
              },
            ],
          },
        ],
      }

      const result = parseProjectFile(projectWithImage)
      expect(result.success).toBe(true)
    })

    test('必須フィールドが欠けている場合は失敗する', () => {
      const invalidProject = {
        version: 1,
        // name is missing
        canvasWidth: 800,
        canvasHeight: 600,
      }

      const result = parseProjectFile(invalidProject)
      expect(result.success).toBe(false)
    })

    test('無効なバージョン（0以下）の場合は失敗する', () => {
      const result = parseProjectFile({
        ...validProject,
        version: 0,
      })

      expect(result.success).toBe(false)
    })

    test('空のname場合は失敗する', () => {
      const result = parseProjectFile({
        ...validProject,
        name: '',
      })

      expect(result.success).toBe(false)
    })

    test('空のlayers配列の場合は失敗する', () => {
      const result = parseProjectFile({
        ...validProject,
        layers: [],
      })

      expect(result.success).toBe(false)
    })

    test('無効なレイヤーブレンドモードの場合は失敗する', () => {
      const result = parseProjectFile({
        ...validProject,
        layers: [
          {
            ...validProject.layers[0],
            blendMode: 'invalid-mode',
          },
        ],
      })

      expect(result.success).toBe(false)
    })

    test('無効なDrawableタイプの場合は失敗する', () => {
      const result = parseProjectFile({
        ...validProject,
        layers: [
          {
            ...validProject.layers[0],
            drawables: [
              {
                id: 'invalid-1',
                createdAt: 1704067200000,
                type: 'unknown',
              },
            ],
          },
        ],
      })

      expect(result.success).toBe(false)
    })

    test('opacityが範囲外の場合は失敗する', () => {
      const result = parseProjectFile({
        ...validProject,
        layers: [
          {
            ...validProject.layers[0],
            opacity: 1.5,
          },
        ],
      })

      expect(result.success).toBe(false)
    })

    test('失敗時にZodErrorとissue詳細を返す', () => {
      const result = parseProjectFile({
        version: 'not a number',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })

  describe('projectFileSchema.safeParse', () => {
    test('すべてのレイヤータイプをバリデートする', () => {
      const projectWithBackground = {
        ...validProject,
        layers: [
          {
            id: 'background',
            name: 'Background',
            type: 'background',
            isVisible: false,
            isLocked: true,
            opacity: 1,
            blendMode: 'normal',
            drawables: [],
          },
          ...validProject.layers,
        ],
      }

      const result = projectFileSchema.safeParse(projectWithBackground)
      expect(result.success).toBe(true)
    })

    test('すべてのブレンドモードをバリデートする', () => {
      const blendModes = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten'] as const

      for (const blendMode of blendModes) {
        const project = {
          ...validProject,
          layers: [
            {
              ...validProject.layers[0],
              blendMode,
            },
          ],
        }

        const result = projectFileSchema.safeParse(project)
        expect(result.success).toBe(true)
      }
    })

    test('すべてのブラシ先端タイプをバリデートする', () => {
      const brushTipTypes = ['solid', 'soft', 'airbrush'] as const

      for (const tipType of brushTipTypes) {
        const project = {
          ...validProject,
          layers: [
            {
              ...validProject.layers[0],
              drawables: [
                {
                  id: 'stroke-1',
                  createdAt: 1704067200000,
                  type: 'stroke',
                  points: [{ x: 0, y: 0 }],
                  style: {
                    color: '#000000',
                    brushTip: {
                      type: tipType,
                      size: 5,
                      hardness: 0.5,
                      opacity: 1,
                    },
                    blendMode: 'normal',
                  },
                },
              ],
            },
          ],
        }

        const result = projectFileSchema.safeParse(project)
        expect(result.success).toBe(true)
      }
    })
  })
})
