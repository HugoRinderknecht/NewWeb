/**
 * 存储键名管理器模块
 *
 * 提供智能的版本化存储键管理和数据迁移功能
 *
 * ## 主要功能
 *
 * - 自动生成当前版本的存储键名
 * - 检测当前版本数据是否存在
 * - 查找其他版本的同名存储数据
 * - 自动将旧版本数据迁移到当前版本
 * - 数据迁移日志记录
 * - 迁移失败的错误处理
 *
 * ## 使用场景
 *
 * - Pinia Store 持久化插件中获取存储键
 * - 应用版本升级时自动迁移用户数据
 * - 避免版本升级导致的数据丢失
 * - 实现平滑的版本过渡
 *
 * ## 工作流程
 *
 * 1. 优先使用当前版本的存储键
 * 2. 如果当前版本无数据，查找其他版本的同名数据
 * 3. 找到旧版本数据后自动迁移到当前版本
 * 4. 返回当前版本的存储键供使用
 *
 * @module utils/storage/storage-key-manager
 * @author Dreamcraft_Astra Team
 */
import { StorageConfig } from '@/utils/storage'

/**
 * 存储键名管理器
 * 负责处理版本化的存储键名生成和数据迁移
 */
export class StorageKeyManager {
  private getCurrentVersionKey(storeId: string): string {
    return StorageConfig.generateStorageKey(storeId)
  }

  private hasCurrentVersionData(key: string, storage: Storage = localStorage): boolean {
    return storage.getItem(key) !== null
  }

  private findExistingKey(storeId: string, storage: Storage = localStorage): string | null {
    const storageKeys = Object.keys(storage)
    const pattern = StorageConfig.createKeyPattern(storeId)

    return storageKeys.find((key) => pattern.test(key) && storage.getItem(key)) || null
  }

  private migrateData(fromKey: string, toKey: string, storage: Storage = localStorage): void {
    try {
      const existingData = storage.getItem(fromKey)
      if (existingData) {
        storage.setItem(toKey, existingData)
        console.info(`[Storage] 已迁移数据: ${fromKey} → ${toKey}`)
      }
    } catch (error) {
      console.warn(`[Storage] 数据迁移失败: ${fromKey}`, error)
    }
  }

  getStorageKey(storeId: string, storage: Storage = localStorage): string {
    const currentKey = this.getCurrentVersionKey(storeId)

    if (this.hasCurrentVersionData(currentKey, storage)) {
      return currentKey
    }

    const existingKey = this.findExistingKey(storeId, storage)
    if (existingKey) {
      this.migrateData(existingKey, currentKey, storage)
    }

    return currentKey
  }
}
