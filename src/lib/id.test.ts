import { describe, test, expect } from 'vitest'
import { generateId } from './id'

describe('generateId', () => {
  test('ユニークなIDを生成する', () => {
    const id1 = generateId()
    const id2 = generateId()

    expect(id1).not.toBe(id2)
  })

  test('プレフィックスなしでIDを生成する', () => {
    const id = generateId()

    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })

  test('プレフィックス付きでIDを生成する', () => {
    const id = generateId('test')

    expect(id).toMatch(/^test-\d+-[a-z0-9]+$/)
  })

  test('指定されたプレフィックスがIDに含まれる', () => {
    const id = generateId('drawable')

    expect(id.startsWith('drawable-')).toBe(true)
  })
})
