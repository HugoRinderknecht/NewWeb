import { describe, it, expect } from 'vitest'
import { projectKeys } from '@/api/queries/project'

describe('projectKeys', () => {
  it('all 应返回 ["project"]', () => {
    expect(projectKeys.all).toEqual(['project'])
  })

  it('lists 应返回 ["project", "list"]', () => {
    expect(projectKeys.lists()).toEqual(['project', 'list'])
  })

  it('list 带参数应包含搜索参数', () => {
    const params = { page: 1, pageSize: 10, keyword: 'test' }
    const key = projectKeys.list(params)
    expect(key[0]).toBe('project')
    expect(key[1]).toBe('list')
    expect(key[2]).toEqual(params)
  })

  it('detail 应包含项目 ID', () => {
    expect(projectKeys.detail('abc-123')).toEqual(['project', 'detail', 'abc-123'])
  })

  it('members 应包含项目 ID', () => {
    expect(projectKeys.members('p1')).toEqual(['project', 'members', 'p1'])
  })

  it('memberList 带参数应包含搜索参数', () => {
    const params = { keyword: '张三' }
    const key = projectKeys.memberList('p1', params)
    expect(key).toContainEqual(params)
  })

  it('config 应包含项目 ID', () => {
    expect(projectKeys.config('p1')).toEqual(['project', 'config', 'p1'])
  })

  it('reviewConfig 应包含项目 ID', () => {
    expect(projectKeys.reviewConfig('p1')).toEqual(['project', 'review-config', 'p1'])
  })

  it('statistics 应包含项目 ID', () => {
    expect(projectKeys.statistics('p1')).toEqual(['project', 'statistics', 'p1'])
  })
})
