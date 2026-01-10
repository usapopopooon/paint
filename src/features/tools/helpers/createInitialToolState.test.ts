import { describe, test, expect } from 'vitest'
import { createInitialToolState, isDrawingToolType } from './createInitialToolState'
import { penBehavior, eraserBehavior } from '../domain'

describe('createInitialToolState', () => {
  test('デフォルトで未選択状態の初期状態を作成する', () => {
    const state = createInitialToolState()

    expect(state.currentType).toBe('none')
  })

  test('lastDrawingToolTypeは初期状態でnullである', () => {
    const state = createInitialToolState()

    expect(state.lastDrawingToolType).toBeNull()
  })

  test('penBehavior.defaultConfigからペン設定を作成する', () => {
    const state = createInitialToolState()

    expect(state.penConfig).toEqual(penBehavior.defaultConfig())
  })

  test('eraserBehavior.defaultConfigから消しゴム設定を作成する', () => {
    const state = createInitialToolState()

    expect(state.eraserConfig).toEqual(eraserBehavior.defaultConfig())
  })

  test('毎回新しいオブジェクトを返す', () => {
    const state1 = createInitialToolState()
    const state2 = createInitialToolState()

    expect(state1).not.toBe(state2)
    expect(state1.penConfig).not.toBe(state2.penConfig)
    expect(state1.eraserConfig).not.toBe(state2.eraserConfig)
  })
})

describe('isDrawingToolType', () => {
  test('penに対してtrueを返す', () => {
    expect(isDrawingToolType('pen')).toBe(true)
  })

  test('brushに対してtrueを返す', () => {
    expect(isDrawingToolType('brush')).toBe(true)
  })

  test('eraserに対してtrueを返す', () => {
    expect(isDrawingToolType('eraser')).toBe(true)
  })

  test('handに対してfalseを返す', () => {
    expect(isDrawingToolType('hand')).toBe(false)
  })

  test('eyedropperに対してfalseを返す', () => {
    expect(isDrawingToolType('eyedropper')).toBe(false)
  })

  test('noneに対してfalseを返す', () => {
    expect(isDrawingToolType('none')).toBe(false)
  })
})
