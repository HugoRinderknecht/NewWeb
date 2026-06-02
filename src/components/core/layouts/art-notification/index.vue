<!-- 通知组件 -->
<template>
  <div
    class="art-notification-panel art-card-sm !shadow-xl"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    v-show="visible"
    @click.stop
  >
    <div class="flex-cb px-3.5 mt-3.5">
      <span class="text-base font-medium text-g-800">通知中心</span>
      <span class="text-xs text-g-800 px-1.5 py-1 c-p select-none rounded hover:bg-g-200" @click="handleMarkAllRead">
        全部已读
      </span>
    </div>

    <ul class="box-border flex items-end w-full h-12.5 px-3.5 border-b-d">
      <li
        v-for="(item, index) in barList"
        :key="index"
        class="h-12 leading-12 mr-5 overflow-hidden text-[13px] text-g-700 c-p select-none"
        :class="{ 'bar-active': barActiveIndex === index }"
        @click="changeBar(index)"
      >
        {{ item.name }} ({{ item.num }})
      </li>
    </ul>

    <div class="w-full h-[calc(100%-95px)]">
      <div class="h-[calc(100%-60px)] overflow-y-scroll scrollbar-thin">
        <!-- 通知 -->
        <ul v-show="barActiveIndex === 0">
          <li
            v-for="(item, index) in noticeList"
            :key="index"
            class="box-border flex-c px-3.5 py-3.5 c-p last:border-b-0 hover:bg-g-200/60"
          >
            <div
              class="size-9 leading-9 text-center rounded-lg flex-cc"
              :class="[getNoticeStyle(item.type).iconClass]"
            >
              <ArtSvgIcon class="text-lg !bg-transparent" :icon="getNoticeStyle(item.type).icon" />
            </div>
            <div class="w-[calc(100%-45px)] ml-3.5">
              <h4 class="text-sm font-normal leading-5.5 text-g-900">{{ item.title }}</h4>
              <p class="mt-1.5 text-xs text-g-500">{{ item.time }}</p>
            </div>
          </li>
        </ul>

        <!-- 消息 -->
        <ul v-show="barActiveIndex === 1">
          <li
            v-for="(item, index) in msgList"
            :key="index"
            class="box-border flex-c px-3.5 py-3.5 c-p last:border-b-0 hover:bg-g-200/60"
          >
            <div class="w-9 h-9">
              <img :src="item.avatar" class="w-full h-full rounded-lg" />
            </div>
            <div class="w-[calc(100%-45px)] ml-3.5">
              <h4 class="text-xs font-normal leading-5.5">{{ item.title }}</h4>
              <p class="mt-1.5 text-xs text-g-500">{{ item.time }}</p>
            </div>
          </li>
        </ul>

        <!-- 待办 -->
        <ul v-show="barActiveIndex === 2">
          <li
            v-for="(item, index) in pendingList"
            :key="index"
            class="box-border px-5 py-3.5 last:border-b-0"
          >
            <h4>{{ item.title }}</h4>
            <p class="text-xs text-g-500">{{ item.time }}</p>
          </li>
        </ul>

        <!-- 空状态 -->
        <div
          v-show="currentTabIsEmpty"
          class="relative top-25 h-full text-g-500 text-center !bg-transparent"
        >
          <ArtSvgIcon icon="system-uicons:inbox" class="text-5xl" />
          <p class="mt-3.5 text-xs !bg-transparent"
            >暂无{{ barList[barActiveIndex].name }}</p
          >
        </div>
      </div>

      <div class="relative box-border w-full px-3.5">
        <ElButton class="w-full mt-3" @click="handleViewAll" v-ripple>
          查看全部
        </ElButton>
      </div>
    </div>

    <div class="h-25"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    fetchGetNotificationList,
    fetchGetUnreadCount,
    fetchMarkAllAsRead
  } from '@/api/notification'

  defineOptions({ name: 'ArtNotification' })

  interface NoticeItem {
    /** 标题 */
    title: string
    /** 时间 */
    time: string
    /** 类型 */
    type: NoticeType
  }

  interface MessageItem {
    /** 标题 */
    title: string
    /** 时间 */
    time: string
    /** 头像 */
    avatar: string
  }

  interface PendingItem {
    /** 标题 */
    title: string
    /** 时间 */
    time: string
  }

  interface BarItem {
    /** 名称 */
    name: ComputedRef<string>
    /** 数量 */
    num: number
  }

  interface NoticeStyle {
    /** 图标 */
    icon: string
    /** icon 样式 */
    iconClass: string
  }

  type NoticeType = 'email' | 'message' | 'collection' | 'user' | 'notice'

  const props = defineProps<{
    value: boolean
  }>()

  const emit = defineEmits<{
    'update:value': [value: boolean]
  }>()

  const show = ref(false)
  const visible = ref(false)
  const barActiveIndex = ref(0)
  const router = useRouter()

  /** 将后端通知类型映射为组件 NoticeType */
  const mapNoticeType = (type: string): NoticeType => {
    const typeMap: Record<string, NoticeType> = {
      email: 'email',
      message: 'message',
      collection: 'collection',
      user: 'user',
      notice: 'notice'
    }
    return typeMap[type] || 'notice'
  }

  /** 格式化时间 */
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
  }

  const useNotificationData = () => {
    const noticeList = ref<NoticeItem[]>([])
    const msgList = ref<MessageItem[]>([])
    const pendingList = ref<PendingItem[]>([])
    const unreadCount = ref({ notice: 0, message: 0, pending: 0 })

    const loading = ref(false)

    /** 加载通知和消息数据 */
    const loadData = async () => {
      loading.value = true
      try {
        const [noticeRes, msgRes, unreadRes] = await Promise.allSettled([
          fetchGetNotificationList({ current: 1, size: 5 }),
          fetchGetNotificationList({ current: 1, size: 5, type: 'message' }),
          fetchGetUnreadCount()
        ])

        // 处理通知列表
        if (noticeRes.status === 'fulfilled' && noticeRes.value?.records) {
          noticeList.value = noticeRes.value.records.map((item) => ({
            title: item.title,
            time: formatTime(item.createTime),
            type: mapNoticeType(item.type)
          }))
        }

        // 处理消息列表
        if (msgRes.status === 'fulfilled' && msgRes.value?.records) {
          msgList.value = msgRes.value.records.map((item) => ({
            title: item.title,
            time: formatTime(item.createTime),
            avatar: item.avatar || ''
          }))
        }

        // 处理未读数量
        if (unreadRes.status === 'fulfilled' && typeof unreadRes.value === 'number') {
          unreadCount.value.notice = unreadRes.value
          unreadCount.value.message = unreadRes.value
        }
      } catch {
        // 静默处理错误
      } finally {
        loading.value = false
      }
    }

    // 标签栏数据
    const barList = computed<BarItem[]>(() => [
      {
        name: computed(() => '通知'),
        num: unreadCount.value.notice
      },
      {
        name: computed(() => '消息'),
        num: unreadCount.value.message
      },
      {
        name: computed(() => '待办'),
        num: unreadCount.value.pending
      }
    ])

    return {
      noticeList,
      msgList,
      pendingList,
      barList,
      loadData
    }
  }

  // 样式管理
  const useNotificationStyles = () => {
    const noticeStyleMap: Record<NoticeType, NoticeStyle> = {
      email: {
        icon: 'ri:mail-line',
        iconClass: 'bg-warning/12 text-warning'
      },
      message: {
        icon: 'ri:volume-down-line',
        iconClass: 'bg-success/12 text-success'
      },
      collection: {
        icon: 'ri:heart-3-line',
        iconClass: 'bg-danger/12 text-danger'
      },
      user: {
        icon: 'ri:volume-down-line',
        iconClass: 'bg-info/12 text-info'
      },
      notice: {
        icon: 'ri:notification-3-line',
        iconClass: 'bg-theme/12 text-theme'
      }
    }

    const getNoticeStyle = (type: NoticeType): NoticeStyle => {
      const defaultStyle: NoticeStyle = {
        icon: 'ri:arrow-right-circle-line',
        iconClass: 'bg-theme/12 text-theme'
      }

      return noticeStyleMap[type] || defaultStyle
    }

    return {
      getNoticeStyle
    }
  }

  // 动画管理
  const useNotificationAnimation = () => {
    const showNotice = (open: boolean) => {
      if (open) {
        visible.value = true
        setTimeout(() => {
          show.value = true
        }, 5)
      } else {
        show.value = false
        setTimeout(() => {
          visible.value = false
        }, 350)
      }
    }

    return {
      showNotice
    }
  }

  // 标签页管理
  const useTabManagement = (
    noticeList: Ref<NoticeItem[]>,
    msgList: Ref<MessageItem[]>,
    pendingList: Ref<PendingItem[]>,
    businessHandlers: {
      handleNoticeAll: () => void
      handleMsgAll: () => void
      handlePendingAll: () => void
    }
  ) => {
    const changeBar = (index: number) => {
      barActiveIndex.value = index
    }

    // 检查当前标签页是否为空
    const currentTabIsEmpty = computed(() => {
      const tabDataMap = [noticeList.value, msgList.value, pendingList.value]

      const currentData = tabDataMap[barActiveIndex.value]
      return currentData && currentData.length === 0
    })

    const handleViewAll = () => {
      // 查看全部处理器映射
      const viewAllHandlers: Record<number, () => void> = {
        0: businessHandlers.handleNoticeAll,
        1: businessHandlers.handleMsgAll,
        2: businessHandlers.handlePendingAll
      }

      const handler = viewAllHandlers[barActiveIndex.value]
      handler?.()

      // 关闭通知面板
      emit('update:value', false)
    }

    return {
      changeBar,
      currentTabIsEmpty,
      handleViewAll
    }
  }

  // 业务逻辑处理
  const useBusinessLogic = () => {
    const handleNoticeAll = () => {
      router.push('/notice/site')
    }

    const handleMsgAll = () => {
      router.push('/notice/site')
    }

    const handlePendingAll = () => {
      router.push('/notice/site')
    }

    const handleMarkAllRead = async () => {
      try {
        await fetchMarkAllAsRead()
        await loadData()
      } catch {
        // 静默处理错误
      }
    }

    return {
      handleNoticeAll,
      handleMsgAll,
      handlePendingAll,
      handleMarkAllRead
    }
  }

  // 组合所有逻辑
  const { noticeList, msgList, pendingList, barList, loadData } = useNotificationData()
  const { getNoticeStyle } = useNotificationStyles()
  const { showNotice } = useNotificationAnimation()
  const { handleNoticeAll, handleMsgAll, handlePendingAll, handleMarkAllRead } = useBusinessLogic()
  const { changeBar, currentTabIsEmpty, handleViewAll } = useTabManagement(
    noticeList,
    msgList,
    pendingList,
    { handleNoticeAll, handleMsgAll, handlePendingAll }
  )

  // 监听属性变化
  watch(
    () => props.value,
    (newValue) => {
      showNotice(newValue)
      if (newValue) {
        loadData()
      }
    }
  )
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-notification-panel {
    @apply absolute 
    top-14.5 
    right-5 
    w-90 
    h-125 
    overflow-hidden 
    transition-all 
    duration-300
    origin-top 
    will-change-[top,left] 
    max-[640px]:top-[65px]
    max-[640px]:right-0
    max-[640px]:w-full 
    max-[640px]:h-[80vh];
  }

  .bar-active {
    color: var(--theme-color) !important;
    border-bottom: 2px solid var(--theme-color);
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 5px !important;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--default-box-color);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #222 !important;
  }
</style>
