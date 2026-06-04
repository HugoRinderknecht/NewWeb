import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { dataFlowBus } from '@/utils/data-flow/bus'

/**
 * DataFlowBus + Vue Query 集成验证测试
 *
 * 验证 DataFlowBus 的核心功能：
 * 1. 通道注册和查询
 * 2. 数据发送和订阅
 * 3. 通道指标统计
 * 4. 订阅取消
 */
describe('DataFlowBus 核心功能验证', () => {
  beforeEach(() => {
    dataFlowBus.init()
  })

  afterEach(() => {
    dataFlowBus.clear()
  })

  it('应能注册通道', () => {
    const result = dataFlowBus.registerChannel({
      id: 'test-channel',
      name: '测试通道',
      source: { type: 'api', id: 'test-api' },
      target: { type: 'page', id: 'test-page' },
      direction: 'one-way'
    })
    expect(result).toBe(true)

    const channels = dataFlowBus.getAllChannels()
    expect(channels).toHaveLength(1)
    expect(channels[0].id).toBe('test-channel')
  })

  it('应能发送和接收数据', async () => {
    dataFlowBus.registerChannel({
      id: 'flow:test',
      name: '测试数据流',
      source: { type: 'api', id: 'test' },
      target: { type: 'page', id: 'test' },
      direction: 'one-way'
    })

    let receivedData: unknown = null
    const unsubscribe = dataFlowBus.subscribe('flow:test', (data) => {
      receivedData = data
    })

    await dataFlowBus.send('flow:test', { action: 'create', id: '123' })
    expect(receivedData).toEqual({ action: 'create', id: '123' })

    unsubscribe()
  })

  it('应能取消订阅', async () => {
    dataFlowBus.registerChannel({
      id: 'flow:unsub-test',
      name: '取消订阅测试',
      source: { type: 'api', id: 'test' },
      target: { type: 'page', id: 'test' },
      direction: 'one-way'
    })

    let callCount = 0
    const unsubscribe = dataFlowBus.subscribe('flow:unsub-test', () => {
      callCount++
    })

    await dataFlowBus.send('flow:unsub-test', { step: 1 })
    expect(callCount).toBe(1)

    unsubscribe()
    await dataFlowBus.send('flow:unsub-test', { step: 2 })
    expect(callCount).toBe(1)
  })

  it('应能追踪指标', async () => {
    dataFlowBus.registerChannel({
      id: 'flow:metrics',
      name: '指标追踪',
      source: { type: 'api', id: 'test' },
      target: { type: 'page', id: 'test' },
      direction: 'one-way'
    })

    await dataFlowBus.send('flow:metrics', { id: 1 })
    await dataFlowBus.send('flow:metrics', { id: 2 })

    const metrics = dataFlowBus.getMetrics('flow:metrics')
    expect(metrics).not.toBeNull()
    expect(metrics!.total).toBe(2)
  })
})

describe('DataFlowBus 通道不存在时的优雅降级', () => {
  beforeEach(() => {
    dataFlowBus.init()
  })

  afterEach(() => {
    dataFlowBus.clear()
  })

  it('向未注册通道发送数据应静默失败', async () => {
    const result = await dataFlowBus.send('flow:nonexistent', { data: 'test' })
    expect(result.success).toBe(false)
  })

  it('订阅不存在的通道应返回空函数', () => {
    const unsub = dataFlowBus.subscribe('flow:ghost', vi.fn())
    expect(unsub).toBeDefined()
    unsub()
  })
})
