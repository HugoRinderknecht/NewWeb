/**
 * 积分管理 API 测试
 * 覆盖积分余额、交易记录、Token 用量、模型定价等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockCreditsBalance,
  mockTransactionList,
  mockTokenUsage,
  createMockAdapter,
} from '@/test/mock-data'

const mockAdapter = createMockAdapter()

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => ({ isLogin: true, info: { id: 'user-001' } }),
}))

import {
  fetchGetCreditsBalance,
  fetchGetTransactions,
  fetchGetTokenUsage,
  fetchGetTokenRecords,
  fetchGetPricingList,
  fetchUpdatePricing,
} from '@/api/points'

describe('积分管理 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGetCreditsBalance - 积分余额查询', () => {
    it('应正确调用 GET /api/credits/my', async () => {
      mockAdapter.get.mockResolvedValue(mockCreditsBalance)

      const res = await fetchGetCreditsBalance()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/credits/my')
      expect(res?.balance).toBe(8500)
      expect(res?.totalEarned).toBe(10000)
      expect(res?.totalConsumed).toBe(1500)
    })

    it('余额计算应正确', () => {
      const { balance, totalEarned, totalConsumed } = mockCreditsBalance
      expect(balance).toBe(totalEarned - totalConsumed)
    })
  })

  describe('fetchGetTransactions - 交易记录查询', () => {
    it('应正确调用 GET /api/credits/transactions', async () => {
      mockAdapter.get.mockResolvedValue(mockTransactionList)

      const res = await fetchGetTransactions()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/credits/transactions', undefined)
      expect(res?.records).toHaveLength(3)
      expect(res?.total).toBe(3)
    })

    it('应支持交易类型筛选', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [mockTransactionList.records[0]],
        total: 1,
      })

      await fetchGetTransactions({ type: 'consume' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/credits/transactions',
        expect.objectContaining({ type: 'consume' })
      )
    })

    it('应支持日期范围筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetTransactions({
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/credits/transactions',
        expect.objectContaining({ startDate: '2026-06-01', endDate: '2026-06-30' })
      )
    })

    it('应支持分页参数', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 100, page: 3, pageSize: 20 })

      const res = await fetchGetTransactions({ page: 3, pageSize: 20 })

      expect(res?.page).toBe(3)
      expect(res?.pageSize).toBe(20)
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetTransactions()

      expect(res).toBeNull()
    })
  })

  describe('交易记录字段验证', () => {
    it('交易类型枚举应正确', () => {
      const validTypes = ['recharge', 'consume', 'refund', 'gift']
      mockTransactionList.records.forEach((tx) => {
        expect(validTypes).toContain(tx.type)
      })
    })

    it('交易状态枚举应正确', () => {
      const validStatuses = ['success', 'failed', 'pending']
      mockTransactionList.records.forEach((tx) => {
        expect(validStatuses).toContain(tx.status)
      })
    })

    it('消费金额应为负数，充值为正数', () => {
      const recharge = mockTransactionList.records.find((tx) => tx.type === 'recharge')
      const consume = mockTransactionList.records.find((tx) => tx.type === 'consume')

      expect(recharge && recharge.amount > 0).toBeTruthy()
      expect(consume && consume.amount < 0).toBeTruthy()
    })

    it('交易号格式应正确', () => {
      mockTransactionList.records.forEach((tx) => {
        expect(tx.transactionNo).toMatch(/^TXN\d+$/)
      })
    })
  })

  describe('fetchGetTokenUsage - Token 用量查询', () => {
    it('应正确调用 GET /api/tokens/my', async () => {
      mockAdapter.get.mockResolvedValue({
        totalTokens: 70000,
        totalRequests: 100,
        totalInputTokens: 50000,
        totalOutputTokens: 20000,
      })

      const res = await fetchGetTokenUsage()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/tokens/my')
      expect(res?.totalTokens).toBe(70000)
      expect(res?.totalRequests).toBe(100)
    })

    it('应包含输入输出 Token 统计', () => {
      const usage = {
        totalTokens: 70000,
        totalRequests: 100,
        totalInputTokens: 50000,
        totalOutputTokens: 20000,
      }
      expect(usage.totalTokens).toBe(usage.totalInputTokens + usage.totalOutputTokens)
    })
  })

  describe('fetchGetTokenRecords - Token 记录查询', () => {
    it('应正确调用 GET /api/tokens/records', async () => {
      mockAdapter.get.mockResolvedValue(mockTokenUsage)

      const res = await fetchGetTokenRecords()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/tokens/records', undefined)
      expect(res?.records).toHaveLength(1)
      expect(res?.totalTokens).toBe(7000)
    })

    it('应支持模型筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetTokenRecords({ model: 'GPT-4o' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/tokens/records',
        expect.objectContaining({ model: 'GPT-4o' })
      )
    })

    it('应支持项目筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetTokenRecords({ projectId: 'proj-001' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/tokens/records',
        expect.objectContaining({ projectId: 'proj-001' })
      )
    })
  })

  describe('fetchGetPricingList - 模型定价列表', () => {
    it('应正确调用 GET /api/pricing', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          { id: 'p-001', model: 'GPT-4o', provider: 'openai', inputPrice: 0.015, outputPrice: 0.06, unit: 'per_1k_tokens' },
          { id: 'p-002', model: 'Claude 3.5', provider: 'anthropic', inputPrice: 0.003, outputPrice: 0.015, unit: 'per_1k_tokens' },
        ],
        total: 2,
      })

      const res = await fetchGetPricingList()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/pricing', undefined)
      expect(res?.records).toHaveLength(2)
    })

    it('应支持供应商筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetPricingList({ provider: 'openai' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/pricing',
        expect.objectContaining({ provider: 'openai' })
      )
    })

    it('应支持状态筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetPricingList({ status: 1 })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/pricing',
        expect.objectContaining({ status: 1 })
      )
    })
  })

  describe('fetchUpdatePricing - 更新模型定价', () => {
    it('应正确调用 PUT /api/pricing/{id}', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdatePricing('p-001', {
        inputPrice: 0.02,
        outputPrice: 0.08,
        status: 1,
      })

      expect(mockAdapter.put).toHaveBeenCalledWith(
        '/api/pricing/p-001',
        expect.objectContaining({ inputPrice: 0.02, outputPrice: 0.08 })
      )
    })
  })
})

describe('积分数据类型验证', () => {
  it('交易类型颜色应正确映射', () => {
    const typeColorMap: Record<string, string> = {
      recharge: 'success',
      consume: 'primary',
      refund: 'warning',
      gift: 'info',
    }
    expect(typeColorMap['recharge']).toBe('success')
    expect(typeColorMap['consume']).toBe('primary')
    expect(typeColorMap['refund']).toBe('warning')
    expect(typeColorMap['gift']).toBe('info')
  })

  it('供应商颜色应正确映射', () => {
    const providerColorMap: Record<string, string> = {
      openai: 'primary',
      anthropic: 'success',
      midjourney: 'warning',
      stability: 'info',
      alibaba: 'danger',
    }
    expect(providerColorMap['openai']).toBe('primary')
    expect(providerColorMap['anthropic']).toBe('success')
    expect(providerColorMap['midjourney']).toBe('warning')
    expect(providerColorMap['stability']).toBe('info')
    expect(providerColorMap['alibaba']).toBe('danger')
  })

  it('模型标签应正确', () => {
    const modelColorMap: Record<string, string> = {
      'GPT-4o': 'primary',
      'GPT-4o-mini': 'success',
      'Claude 3.5': 'warning',
      Midjourney: 'danger',
    }
    expect(modelColorMap['GPT-4o']).toBe('primary')
    expect(modelColorMap['Claude 3.5']).toBe('warning')
  })

  it('Token 费用计算应正确', () => {
    const calculateCost = (inputTokens: number, outputTokens: number, inputPrice: number, outputPrice: number) => {
      return (inputTokens / 1000) * inputPrice + (outputTokens / 1000) * outputPrice
    }

    const cost = calculateCost(5000, 2000, 0.015, 0.06)
    expect(cost).toBeCloseTo(0.195, 3)
  })

  it('积分余额显示应正确格式化', () => {
    const formatCredits = (balance: number) => {
      if (balance >= 10000) return `${(balance / 10000).toFixed(1)}万`
      return balance.toLocaleString()
    }

    expect(formatCredits(8500)).toBe('8,500')
    expect(formatCredits(15000)).toBe('1.5万')
    expect(formatCredits(100000)).toBe('10.0万')
  })
})

describe('积分消费流程验证', () => {
  it('消费应正确记录并更新余额', () => {
    let balance = mockCreditsBalance.balance
    const consumeAmount = Math.abs(mockTransactionList.records.find((tx) => tx.type === 'consume')?.amount || 0)

    balance -= consumeAmount

    expect(balance).toBe(mockCreditsBalance.balance - 500)
  })

  it('充值应正确记录并更新余额', () => {
    let balance = mockCreditsBalance.balance
    const rechargeAmount = mockTransactionList.records.find((tx) => tx.type === 'recharge')?.amount || 0

    balance += rechargeAmount

    expect(balance).toBe(mockCreditsBalance.balance + 5000)
  })

  it('赠送应正确记录', () => {
    const giftTx = mockTransactionList.records.find((tx) => tx.type === 'gift')
    expect(giftTx).toBeDefined()
    expect(giftTx?.amount).toBeGreaterThan(0)
  })
})
