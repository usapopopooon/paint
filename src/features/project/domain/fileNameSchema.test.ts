import { describe, test, expect } from 'vitest'
import { fileNameSchema, MAX_FILE_NAME_LENGTH } from './fileNameSchema'

describe('fileNameSchema', () => {
  describe('有効なファイル名', () => {
    test('通常のファイル名を許容する', () => {
      const result = fileNameSchema.safeParse('my-project')
      expect(result.success).toBe(true)
    })

    test('日本語のファイル名を許容する', () => {
      const result = fileNameSchema.safeParse('プロジェクト1')
      expect(result.success).toBe(true)
    })

    test('スペースを含むファイル名を許容する', () => {
      const result = fileNameSchema.safeParse('my project')
      expect(result.success).toBe(true)
    })

    test('数字のみのファイル名を許容する', () => {
      const result = fileNameSchema.safeParse('123')
      expect(result.success).toBe(true)
    })

    test('ドットを含むファイル名を許容する', () => {
      const result = fileNameSchema.safeParse('project.v1')
      expect(result.success).toBe(true)
    })

    test('最大長のファイル名を許容する', () => {
      const result = fileNameSchema.safeParse('a'.repeat(MAX_FILE_NAME_LENGTH))
      expect(result.success).toBe(true)
    })
  })

  describe('無効なファイル名', () => {
    test('空文字を拒否する', () => {
      const result = fileNameSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    test('最大長を超えるファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('a'.repeat(MAX_FILE_NAME_LENGTH + 1))
      expect(result.success).toBe(false)
    })

    test('バックスラッシュを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my\\project')
      expect(result.success).toBe(false)
    })

    test('スラッシュを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my/project')
      expect(result.success).toBe(false)
    })

    test('コロンを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my:project')
      expect(result.success).toBe(false)
    })

    test('アスタリスクを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my*project')
      expect(result.success).toBe(false)
    })

    test('クエスチョンマークを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my?project')
      expect(result.success).toBe(false)
    })

    test('ダブルクォートを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my"project')
      expect(result.success).toBe(false)
    })

    test('パイプを含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my|project')
      expect(result.success).toBe(false)
    })

    test('小なり記号を含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my<project')
      expect(result.success).toBe(false)
    })

    test('大なり記号を含むファイル名を拒否する', () => {
      const result = fileNameSchema.safeParse('my>project')
      expect(result.success).toBe(false)
    })
  })
})
