<template>
  <div class="notice-site-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">站内通知</span>
        </div>
      </template>
      <ElTable :data="noticeList" style="width: 100%">
        <ElTableColumn prop="title" label="通知标题" />
        <ElTableColumn prop="content" label="内容" />
        <ElTableColumn prop="time" label="发布时间" />
        <ElTableColumn prop="status" label="状态">
          <template #default="{ row }">
            <ElTag :type="row.status === '已读' ? 'info' : 'primary'">{{ row.status }}</ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useQueryClient } from '@tanstack/vue-query'
  import {
    useNotificationList,
    useSearchNotifications,
    useDeleteNotification,
    useMarkAsUnread,
    useBatchMarkAsRead,
    useBatchDeleteNotifications,
    useStarNotification
  } from '@/api/queries'
  import { fetchGetNotificationDetail, fetchGetStarredNotifications } from '@/api/notification'

  defineOptions({ name: 'NoticeSite' })

  const queryClient = useQueryClient()

  // 搜索关键词
  const searchKeyword = ref<string>()

  // 查询 hooks
  const { data: notificationListData } = useNotificationList()
  const { data: searchData } = useSearchNotifications(searchKeyword)

  // 转换通知列表数据
  const noticeList = computed(() => {
    const rawData = searchKeyword.value ? searchData.value : notificationListData.value
    const records = (rawData as any)?.records || rawData || []
    return records.map((item: any) => ({
      title: item.title || '',
      content: item.content || '',
      time: item.createTime || '',
      status: item.status === 'read' ? '已读' : '未读',
      id: item.id,
      type: item.type,
      starred: item.starred || false,
      sender: item.sender || '',
      senderAvatar: item.senderAvatar || item.avatar || ''
    }))
  })

  // 变更 hooks
  const { mutateAsync: deleteNotification } = useDeleteNotification()
  const { mutateAsync: markAsUnread } = useMarkAsUnread()
  const { mutateAsync: batchMarkAsRead } = useBatchMarkAsRead()
  const { mutateAsync: batchDeleteNotifications } = useBatchDeleteNotifications()
  const { mutateAsync: starNotification } = useStarNotification()

  const handleGetDetail = async (id: string) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: ['notifications', 'detail', id],
        queryFn: () => fetchGetNotificationDetail(id),
        staleTime: 60 * 1000
      })
    } catch {
      return null
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await ElMessageBox.confirm('确定要删除该通知吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteNotification(id)
      ElMessage.success('删除成功')
    } catch {
      // 用户取消或删除失败
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      await markAsUnread(id)
      ElMessage.success('已标记为未读')
    } catch {
      ElMessage.error('操作失败')
    }
  }

  const handleBatchMarkAsRead = async (ids: string[]) => {
    try {
      await batchMarkAsRead(ids)
      ElMessage.success('批量已读成功')
    } catch {
      ElMessage.error('批量已读失败')
    }
  }

  const handleBatchDelete = async (ids: string[]) => {
    try {
      await batchDeleteNotifications(ids)
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.error('批量删除失败')
    }
  }

  const handleStar = async (id: string) => {
    const item = noticeList.value.find((n: any) => n.id === id)
    const wasStarred = item?.starred ?? false
    try {
      await starNotification(id)
      ElMessage.success(wasStarred ? '已取消收藏' : '已收藏')
    } catch {
      ElMessage.error('收藏操作失败')
    }
  }

  const handleGetStarred = async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['notifications', 'starred'],
        queryFn: () => fetchGetStarredNotifications(),
        staleTime: 30 * 1000
      })
      const records = (data as any)?.records || data || []
      return records
    } catch {
      return []
    }
  }

  const handleSearch = async (keyword: string) => {
    searchKeyword.value = keyword || undefined
  }

  const loadNoticeList = async () => {
    searchKeyword.value = undefined
    await queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
  }

  defineExpose({
    handleGetDetail,
    handleDelete,
    handleMarkAsUnread,
    handleBatchMarkAsRead,
    handleBatchDelete,
    handleStar,
    handleGetStarred,
    handleSearch,
    loadNoticeList
  })
</script>
