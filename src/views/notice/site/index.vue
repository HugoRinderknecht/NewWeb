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
  import {
    fetchGetNotificationList,
    fetchGetNotificationDetail,
    fetchDeleteNotification,
    fetchMarkAsUnread,
    fetchBatchMarkAsRead,
    fetchBatchDeleteNotifications,
    fetchStarNotification,
    fetchGetStarredNotifications,
    fetchSearchNotifications
  } from '@/api/notification'

  defineOptions({ name: 'NoticeSite' })

  const loading = ref(false)
  const noticeList = ref<any[]>([])

  const loadNoticeList = async () => {
    loading.value = true
    try {
      const res = await fetchGetNotificationList()
      const records = (res as any)?.records || res || []
      noticeList.value = records.map((item: any) => ({
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
    } catch {
      noticeList.value = [
        {
          title: '系统维护通知',
          content: '系统将于今晚进行维护',
          time: '2024-01-15',
          status: '未读',
          id: '1'
        },
        {
          title: '功能更新',
          content: '新增AI视频生成功能',
          time: '2024-01-14',
          status: '已读',
          id: '2'
        }
      ]
    } finally {
      loading.value = false
    }
  }

  const handleGetDetail = async (id: string) => {
    try {
      return await fetchGetNotificationDetail(id)
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
      await fetchDeleteNotification(id)
      noticeList.value = noticeList.value.filter((n) => n.id !== id)
      ElMessage.success('删除成功')
    } catch {
      // 用户取消或删除失败
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      await fetchMarkAsUnread(id)
      const item = noticeList.value.find((n) => n.id === id)
      if (item) item.status = '未读'
      ElMessage.success('已标记为未读')
    } catch {
      ElMessage.error('操作失败')
    }
  }

  const handleBatchMarkAsRead = async (ids: string[]) => {
    try {
      await fetchBatchMarkAsRead(ids)
      noticeList.value.forEach((n) => {
        if (ids.includes(n.id)) n.status = '已读'
      })
      ElMessage.success('批量已读成功')
    } catch {
      ElMessage.error('批量已读失败')
    }
  }

  const handleBatchDelete = async (ids: string[]) => {
    try {
      await fetchBatchDeleteNotifications(ids)
      noticeList.value = noticeList.value.filter((n) => !ids.includes(n.id))
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.error('批量删除失败')
    }
  }

  const handleStar = async (id: string) => {
    try {
      await fetchStarNotification(id)
      const item = noticeList.value.find((n) => n.id === id)
      if (item) item.starred = !item.starred
      ElMessage.success(item?.starred ? '已收藏' : '已取消收藏')
    } catch {
      ElMessage.error('收藏操作失败')
    }
  }

  const handleGetStarred = async () => {
    try {
      const res = await fetchGetStarredNotifications()
      const records = (res as any)?.records || res || []
      return records
    } catch {
      return []
    }
  }

  const handleSearch = async (keyword: string) => {
    if (!keyword) {
      await loadNoticeList()
      return
    }
    loading.value = true
    try {
      const res = await fetchSearchNotifications(keyword)
      const records = (res as any)?.records || res || []
      noticeList.value = records.map((item: any) => ({
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
    } catch {
      ElMessage.error('搜索失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadNoticeList()
  })

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
