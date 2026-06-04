import { describe, it, expect } from 'vitest'
import {
  useProjectList,
  useProjectDetail,
  useProjectMembers,
  useProjectConfig,
  useReviewConfig,
  useProjectStatistics,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useArchiveProject,
  useRestoreProject,
  useCopyProject,
  useUploadProjectCover,
  useAddProjectMember,
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
  useUpdateProjectConfig,
  useUpdateReviewConfig,
  useProjectEpisodes,
} from '@/api/queries/project'

describe('project queries 导出验证', () => {
  it('应导出所有 query composables', () => {
    expect(useProjectList).toBeTypeOf('function')
    expect(useProjectDetail).toBeTypeOf('function')
    expect(useProjectMembers).toBeTypeOf('function')
    expect(useProjectConfig).toBeTypeOf('function')
    expect(useReviewConfig).toBeTypeOf('function')
    expect(useProjectStatistics).toBeTypeOf('function')
    expect(useProjectEpisodes).toBeTypeOf('function')
  })

  it('应导出所有 mutation composables', () => {
    expect(useCreateProject).toBeTypeOf('function')
    expect(useUpdateProject).toBeTypeOf('function')
    expect(useDeleteProject).toBeTypeOf('function')
    expect(useArchiveProject).toBeTypeOf('function')
    expect(useRestoreProject).toBeTypeOf('function')
    expect(useCopyProject).toBeTypeOf('function')
    expect(useUploadProjectCover).toBeTypeOf('function')
    expect(useAddProjectMember).toBeTypeOf('function')
    expect(useUpdateProjectMemberRole).toBeTypeOf('function')
    expect(useRemoveProjectMember).toBeTypeOf('function')
    expect(useUpdateProjectConfig).toBeTypeOf('function')
    expect(useUpdateReviewConfig).toBeTypeOf('function')
  })
})
