import { describe, test, expect } from 'vitest'
import { layerNameSchema, MAX_LAYER_NAME_LENGTH } from './layerNameSchema'

describe('layerNameSchema', () => {
  describe('有効なレイヤー名', () => {
    test('通常のレイヤー名を許容する', () => {
      const result = layerNameSchema.safeParse('Layer 1')
      expect(result.success).toBe(true)
    })

    test('日本語のレイヤー名を許容する', () => {
      const result = layerNameSchema.safeParse('レイヤー1')
      expect(result.success).toBe(true)
    })

    test('1文字のレイヤー名を許容する', () => {
      const result = layerNameSchema.safeParse('a')
      expect(result.success).toBe(true)
    })

    test('最大長のレイヤー名を許容する', () => {
      const result = layerNameSchema.safeParse('a'.repeat(MAX_LAYER_NAME_LENGTH))
      expect(result.success).toBe(true)
    })

    test('スペースを含むレイヤー名を許容する', () => {
      const result = layerNameSchema.safeParse('My Layer Name')
      expect(result.success).toBe(true)
    })

    test('記号を含むレイヤー名を許容する', () => {
      const result = layerNameSchema.safeParse('Layer #1 - Draft')
      expect(result.success).toBe(true)
    })
  })

  describe('無効なレイヤー名', () => {
    test('空文字を拒否する', () => {
      const result = layerNameSchema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe('too_small')
      }
    })

    test('最大長を超えるレイヤー名を拒否する', () => {
      const result = layerNameSchema.safeParse('a'.repeat(MAX_LAYER_NAME_LENGTH + 1))
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe('too_big')
      }
    })
  })

  describe('MAX_LAYER_NAME_LENGTH', () => {
    test('50文字であること', () => {
      expect(MAX_LAYER_NAME_LENGTH).toBe(50)
    })
  })
})
