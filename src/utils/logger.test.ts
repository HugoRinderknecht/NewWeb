import { describe, it, expect } from 'vitest'
import { logger } from '@/utils/logger'

describe('logger', () => {
  it('应正常导出 logger 对象', () => {
    expect(logger).toBeDefined()
    expect(logger.debug).toBeTypeOf('function')
    expect(logger.info).toBeTypeOf('function')
    expect(logger.warn).toBeTypeOf('function')
    expect(logger.error).toBeTypeOf('function')
    expect(logger.apiRequest).toBeTypeOf('function')
    expect(logger.apiSuccess).toBeTypeOf('function')
    expect(logger.apiError).toBeTypeOf('function')
  })

  it('apiRequest 不应抛出异常', () => {
    expect(() => logger.apiRequest('test', 'someApi', { page: 1 })).not.toThrow()
  })

  it('apiError 不应抛出异常', () => {
    expect(() => logger.apiError('test', 'someApi', new Error('fail'))).not.toThrow()
  })
})
