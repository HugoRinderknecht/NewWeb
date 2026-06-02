<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>最新通知</h4>
        <p
          >未读<span class="text-danger">{{ unreadCount }}</span></p
        >
      </div>
      <ElButton type="primary" link size="small" @click="markAllRead">全部已读</ElButton>
    </div>

    <div class="h-[calc(100%-60px)] mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0 cursor-pointer hover:bg-g-100/50 transition-colors px-1"
          v-for="(item, index) in list"
          :key="index"
          @click="handleViewDetail(item)"
        >
          <div class="flex items-center gap-2">
            <div
              class="size-2 rounded-full flex-shrink-0"
              :class="item.read ? 'bg-g-400' : 'bg-primary'"
            />
            <div>
              <p class="text-sm" :class="item.read ? 'text-g-500' : 'text-g-800 font-medium'">
                {{ item.title }}
              </p>
              <p class="text-g-500 mt-0.5 text-xs">{{ item.source }} · {{ item.date }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <ElButton
              v-if="!item.read"
              type="primary"
              link
              size="small"
              @click.stop="handleMarkRead(item)"
            >
              标为已读
            </ElButton>
            <ElButton type="danger" link size="small" @click.stop="handleDelete(item)">
              <ArtSvgIcon icon="ri:delete-bin-line" class="text-sm" />
            </ElButton>
          </div>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetNotificationList } from '@/api/notification'

  interface NoticeItem {
    id: number
    title: string
    source: string
    date: string
    read: boolean
    type: string
  }

  /**
   * 最新通知列表
   * 记录系统通知、审核结果、项目更新等各类消息
   */
  const list = reactive<NoticeItem[]>([])

  const unreadCount = ref(0)

  const loadData = async () => {
    try {
      const res = await fetchGetNotificationList({ current: 1, size: 10 })
      if (res?.records) {
        list.splice(
          0,
          list.length,
          ...res.records.map((item: any) => ({
            id: item.id,
            title: item.title ?? '',
            source: item.source ?? '',
            date: item.createdAt ?? '',
            read: item.isRead ?? false,
            type: item.type ?? ''
          }))
        )
        unreadCount.value = res.records.filter((item: any) => !item.isRead).length
      }
    } catch (error) {
      console.error('获取通知列表失败:', error)
    }
  }

  const handleViewDetail = (item: NoticeItem) => {
    item.read = true
    console.log('查看通知详情:', item.title)
  }

  const handleMarkRead = (item: NoticeItem) => {
    item.read = true
  }

  const markAllRead = () => {
    list.forEach((item) => {
      item.read = true
    })
  }

  const handleDelete = (item: NoticeItem) => {
    const index = list.findIndex((i) => i.id === item.id)
    if (index > -1) {
      list.splice(index, 1)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
