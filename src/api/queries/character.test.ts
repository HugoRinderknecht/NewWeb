import { describe, it, expect } from 'vitest'
import {
  useCharacterList,
  useCharacterDetail,
  useCreateCharacter,
  useUpdateCharacter,
  useDeleteCharacter
} from '@/api/queries/character'

describe('character queries 导出验证', () => {
  it('应导出所有 query composables', () => {
    expect(useCharacterList).toBeTypeOf('function')
    expect(useCharacterDetail).toBeTypeOf('function')
  })

  it('应导出所有 mutation composables', () => {
    expect(useCreateCharacter).toBeTypeOf('function')
    expect(useUpdateCharacter).toBeTypeOf('function')
    expect(useDeleteCharacter).toBeTypeOf('function')
  })
})
