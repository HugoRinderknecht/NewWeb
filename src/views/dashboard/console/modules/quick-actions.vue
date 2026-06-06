<!-- 快捷入口模块 -->
<template>
  <div class="art-card quick-actions-card">
    <div class="quick-actions-header">
      <h4>快捷入口</h4>
      <p>常用功能一键直达</p>
    </div>
    <div class="quick-actions-grid">
      <div
        v-for="(action, index) in actions"
        :key="index"
        class="action-item"
        :class="`action-${action.tone}`"
        :title="action.title"
        @click="handleAction(action)"
      >
        <div class="action-icon-wrap">
          <ArtSvgIcon :icon="action.icon" class="action-icon" />
        </div>
        <span class="action-title">{{ action.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'QuickActions' })

  const router = useRouter()

  type Tone = 'primary' | 'success' | 'warning' | 'info' | 'danger'

  interface ActionItem {
    title: string
    desc: string
    icon: string
    tone: Tone
    routeName?: string
    path?: string
  }

  // 精选 6 个常用入口（按优先度排序）
  const actions: ActionItem[] = [
    {
      title: '新建项目',
      desc: '开启创作',
      icon: 'ri:add-circle-line',
      tone: 'primary',
      path: '/project/list'
    },
    {
      title: '剧本库',
      desc: 'AI 编写',
      icon: 'ri:book-open-line',
      tone: 'info',
      path: '/script/library'
    },
    {
      title: '分镜',
      desc: '智能拆解',
      icon: 'ri:layout-grid-line',
      tone: 'success',
      path: '/storyboard/design'
    },
    {
      title: '素材',
      desc: '视觉资产',
      icon: 'ri:image-2-line',
      tone: 'warning',
      path: '/asset/library'
    },
    {
      title: '视频',
      desc: '一键成片',
      icon: 'ri:movie-2-line',
      tone: 'danger',
      path: '/video-gen/task'
    },
    {
      title: '审核',
      desc: '审阅中心',
      icon: 'ri:shield-check-line',
      tone: 'primary',
      path: '/review/pending'
    }
  ]

  /**
   * 触发快捷入口跳转
   * 通过路由 path 跳转
   */
  function handleAction(action: ActionItem) {
    if (action.path) {
      router.push(action.path)
    } else if (action.routeName) {
      router.push({ name: action.routeName })
    }
  }
</script>

<style lang="scss" scoped>
  .quick-actions-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 0;
    height: 100%;
  }

  .quick-actions-header {
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--art-gray-900);
    }

    p {
      margin: 2px 0 0;
      font-size: 12px;
      color: var(--art-gray-600);
    }
  }

  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 6px;
    border-radius: 8px;
    background: var(--art-gray-100);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.08);
    }
  }

  .action-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .action-primary .action-icon-wrap {
    background: color-mix(in srgb, var(--art-primary) 12%, transparent);
    color: var(--art-primary);
  }

  .action-info .action-icon-wrap {
    background: color-mix(in srgb, var(--art-info) 12%, transparent);
    color: var(--art-info);
  }

  .action-success .action-icon-wrap {
    background: color-mix(in srgb, var(--art-success) 12%, transparent);
    color: var(--art-success);
  }

  .action-warning .action-icon-wrap {
    background: color-mix(in srgb, var(--art-warning) 14%, transparent);
    color: var(--art-warning);
  }

  .action-danger .action-icon-wrap {
    background: color-mix(in srgb, var(--art-error) 12%, transparent);
    color: var(--art-error);
  }

  .action-icon {
    font-size: 18px;
  }

  .action-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--art-gray-700);
    line-height: 1;
  }

  @media (max-width: 768px) {
    .quick-actions-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 480px) {
    .quick-actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
