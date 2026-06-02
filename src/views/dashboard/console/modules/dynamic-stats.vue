<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>动态</h4>
        <p>新增<span class="text-success">+6</span></p>
      </div>
    </div>

    <div class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <span class="text-g-800 font-medium">{{ item.username }}</span>
          <span class="mx-2 text-g-600">{{ item.type }}</span>
          <span class="text-theme">{{ item.target }}</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetRealtimeData } from '@/api/statistics'

  interface DynamicItem {
    username: string
    type: string
    target: string
  }

  /**
   * 用户动态列表
   * 记录用户的关注、发文、提问、兑换等各类活动
   */
  const list = reactive<DynamicItem[]>([])

  const loadData = async () => {
    try {
      const { data } = await fetchGetRealtimeData()
      if (data?.activities) {
        list.splice(
          0,
          list.length,
          ...data.activities.map((item: any) => ({
            username: item.username ?? '',
            type: item.action ?? '',
            target: item.target ?? ''
          }))
        )
      }
    } catch (error) {
      console.error('获取实时动态数据失败:', error)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
