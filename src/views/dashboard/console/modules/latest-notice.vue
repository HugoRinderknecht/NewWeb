<!-- 最新通知模块 -->
<template>
  <div class="art-card p-5 mb-5 latest-notice-card">
    <div class="latest-notice-header">
      <div class="latest-notice-title">
        <h4>最新通知</h4>
        <p>
          未读
          <span class="text-danger font-semibold">{{ unreadCount }}</span>
        </p>
      </div>
      <ElButton type="primary" link size="small" :disabled="!hasUnread" @click="markAllRead">
        全部已读
      </ElButton>
    </div>

    <div class="latest-notice-list">
      <ElScrollbar v-if="list.length">
        <div
          class="notice-item"
          v-for="(item, index) in list"
          :key="item.id || index"
          @click="handleViewDetail(item)"
        >
          <div class="notice-dot" :class="item.read ? 'is-read' : 'is-unread'"></div>
          <div class="notice-content">
            <p class="notice-title" :class="item.read ? 'is-read' : 'is-unread'">
              {{ item.title || '系统通知' }}
            </p>
            <p class="notice-meta">
              <span>{{ item.source || '系统消息' }}</span>
              <span class="notice-dot-sep">·</span>
              <span>{{ formatDate(item.date) }}</span>
            </p>
          </div>
          <ElButton
            v-if="!item.read"
            type="primary"
            link
            size="small"
            class="notice-action"
            @click.stop="handleMarkRead(item)"
          >
            标为已读
          </ElButton>
        </div>
      </ElScrollbar>
      <div v-else class="latest-notice-empty">
        <ArtSvgIcon icon="ri:notification-off-line" class="empty-icon" />
        <p>暂无新通知</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useNotificationList, useMarkAsRead, useMarkAllAsRead } from '@/api/queries'

  defineOptions({ name: 'LatestNotice' })

  interface NoticeItem {
    id: string
    title: string
    source: string
    date: string
    read: boolean
    type: string
  }

  // 统一数据层：通知列表
  const { data: notificationData } = useNotificationList({ current: 1, size: 5 })
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()

  // 通知列表（标准化）
  const list = computed<NoticeItem[]>(() => {
    const records = notificationData.value?.records
    if (!Array.isArray(records)) return []
    return records.map((item: any) => ({
      id: String(item.id ?? ''),
      title: item.title ?? '',
      source: item.source ?? item.sender ?? '系统消息',
      date: item.createTime ?? '',
      read: Boolean(item.isRead ?? item.read ?? false),
      type: item.type ?? ''
    }))
  })

  // 未读数
  const unreadCount = computed(() => list.value.filter((item) => !item.read).length)
  const hasUnread = computed(() => unreadCount.value > 0)

  function formatDate(date: string): string {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
  }

  function handleViewDetail(item: NoticeItem) {
    if (!item.read) {
      markAsReadMutation.mutate(item.id)
    }
  }

  function handleMarkRead(item: NoticeItem) {
    markAsReadMutation.mutate(item.id)
  }

  function markAllRead() {
    markAllAsReadMutation.mutate()
  }
</script>

<style lang="scss" scoped>
  .latest-notice-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 22rem;
    display: flex;
    flex-direction: column;
  }

  .latest-notice-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .latest-notice-title h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .latest-notice-title p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .latest-notice-list {
    flex: 1;
    min-height: 0;
    max-height: 22rem;
  }

  .notice-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 8px;
    border-bottom: 1px solid var(--art-gray-200);
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 6px;

    &:hover {
      background: var(--art-gray-100);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .notice-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 6px;
  }

  .notice-dot.is-unread {
    background: var(--art-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--art-primary) 20%, transparent);
  }

  .notice-dot.is-read {
    background: var(--art-gray-400);
  }

  .notice-content {
    flex: 1;
    min-width: 0;
  }

  .notice-title {
    margin: 0;
    font-size: 13px;
    color: var(--art-gray-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notice-title.is-unread {
    font-weight: 500;
  }

  .notice-title.is-read {
    color: var(--art-gray-500);
  }

  .notice-meta {
    margin: 2px 0 0;
    font-size: 11px;
    color: var(--art-gray-500);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .notice-dot-sep {
    color: var(--art-gray-400);
  }

  .notice-action {
    flex-shrink: 0;
  }

  .latest-notice-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 0;
    color: var(--art-gray-400);

    p {
      margin: 0;
      font-size: 13px;
    }
  }

  .empty-icon {
    font-size: 32px;
  }
</style>
