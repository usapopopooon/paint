import { describe, test, expect } from 'vitest'
import { blendModeToPixi } from './blendModeToPixi'
import type { LayerBlendMode } from '../../types'

describe('blendModeToPixi', () => {
  test('normalモードを正しく変換する', () => {
    expect(blendModeToPixi('normal')).toBe('normal')
  })

  test('multiplyモードを正しく変換する', () => {
    expect(blendModeToPixi('multiply')).toBe('multiply')
  })

  test('screenモードを正しく変換する', () => {
    expect(blendModeToPixi('screen')).toBe('screen')
  })

  test('overlayモードを正しく変換する', () => {
    expect(blendModeToPixi('overlay')).toBe('overlay')
  })

  test('darkenモードを正しく変換する', () => {
    expect(blendModeToPixi('darken')).toBe('darken')
  })

  test('lightenモードを正しく変換する', () => {
    expect(blendModeToPixi('lighten')).toBe('lighten')
  })

  test('すべてのLayerBlendModeが対応している', () => {
    const allModes: LayerBlendMode[] = [
      'normal',
      'multiply',
      'screen',
      'overlay',
      'darken',
      'lighten',
    ]

    for (const mode of allModes) {
      expect(blendModeToPixi(mode)).toBeDefined()
    }
  })
})
