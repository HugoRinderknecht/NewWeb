<!-- 左侧菜单 或 双列菜单 -->
<template>
  <div
    class="layout-sidebar"
    v-if="showLeftMenu || isDualMenu"
    :class="{ 'no-border': menuList.length === 0 }"
  >
    <!-- 双列菜单（左侧） -->
    <div
      v-if="isDualMenu"
      class="dual-menu-left"
      :style="{ width: dualMenuShowText ? '80px' : '64px', background: getMenuTheme.background }"
    >
      <ArtLogo class="logo" @click="navigateToHome" />

      <ElScrollbar style="height: calc(100% - 135px)">
        <ul>
          <li v-for="menu in firstLevelMenus" :key="menu.path" @click="handleModuleClick(menu)">
            <ElTooltip
              class="box-item"
              effect="dark"
              :content="menu.meta.title"
              placement="right"
              :offset="15"
              :hide-after="0"
              :disabled="dualMenuShowText"
            >
              <div
                :class="{
                  'is-active': menu.meta.isFirstLevel
                    ? menu.path === route.path
                    : menu.path === firstLevelMenuPath
                }"
                :style="{
                  height: dualMenuShowText ? '60px' : '46px'
                }"
              >
                <ArtSvgIcon
                  class="menu-icon text-g-700 dark:text-g-800"
                  :icon="menu.meta.icon"
                  :style="{
                    marginBottom: dualMenuShowText ? '5px' : '0'
                  }"
                />
                <span v-if="dualMenuShowText" class="text-md text-g-700">
                  {{ menu.meta.title }}
                </span>
                <div v-if="menu.meta.showBadge" class="art-badge art-badge-dual" />
              </div>
            </ElTooltip>
          </li>
        </ul>
      </ElScrollbar>

      <ArtIconButton
        class="switch-btn size-10"
        icon="ri:arrow-left-right-fill"
        @click="toggleDualMenuMode"
      />
    </div>

    <!-- 左侧菜单 || 双列菜单（右侧） -->
    <div
      v-show="menuList.length > 0"
      class="menu-left"
      :class="`menu-left-${getMenuTheme.theme} menu-left-${!menuOpen ? 'close' : 'open'}`"
      :style="{ background: getMenuTheme.background }"
    >
      <!-- Logo、系统名称 -->
      <div
        class="header"
        @click="navigateToHome"
        :style="{
          background: getMenuTheme.background
        }"
      >
        <ArtLogo v-if="!isDualMenu" class="logo" />

        <p
          :class="{ 'is-dual-menu-name': isDualMenu }"
          :style="{
            color: getMenuTheme.systemNameColor,
            opacity: !menuOpen ? 0 : 1
          }"
        >
          {{ AppConfig.systemInfo.name }}
        </p>
      </div>
      <ElScrollbar :style="scrollbarStyle">
        <ElMenu
          :class="'el-menu-' + getMenuTheme.theme"
          :collapse="!menuOpen"
          :default-active="routerPath"
          :text-color="getMenuTheme.textColor"
          :unique-opened="uniqueOpened"
          :background-color="getMenuTheme.background"
          :default-openeds="defaultOpenedMenus"
          :popper-class="`menu-left-popper menu-left-${getMenuTheme.theme}-popper`"
          :show-timeout="50"
          :hide-timeout="50"
        >
          <SidebarSubmenu
            :list="menuList"
            :isMobile="isMobileMode"
            :theme="getMenuTheme"
            @close="handleMenuClose"
          />
        </ElMenu>
      </ElScrollbar>

      <!-- 双列菜单右侧折叠按钮 -->
      <div class="dual-menu-collapse-btn" v-if="isDualMenu" @click="toggleMenuVisibility">
        <ArtSvgIcon
          class="text-g-500/70"
          :icon="menuOpen ? 'ri:arrow-left-wide-fill' : 'ri:arrow-right-wide-fill'"
        />
      </div>

      <div
        class="menu-model"
        @click="toggleMenuVisibility"
        :style="{
          opacity: !menuOpen ? 0 : 1,
          transform: showMobileModal ? 'scale(1)' : 'scale(0)'
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { useSettingStore } from '@/store/modules/setting'
  import { MenuTypeEnum, MenuWidth } from '@/enums/appEnum'
  import { useMenuStore } from '@/store/modules/menu'
  import { isIframe } from '@/utils/navigation'
  import { handleMenuJump } from '@/utils/navigation'
  import SidebarSubmenu from './widget/SidebarSubmenu.vue'
  import { useCommon } from '@/hooks/core/useCommon'
  import { useWindowSize, useTimeoutFn } from '@vueuse/core'
  import type { AppRouteRecord } from '@/types/router'

  defineOptions({ name: 'ArtSidebarMenu' })

  const MOBILE_BREAKPOINT = 800
  const ANIMATION_DELAY = 350
  const MENU_CLOSE_WIDTH = MenuWidth.CLOSE

  const route = useRoute()
  const router = useRouter()
  const settingStore = useSettingStore()

  const { getMenuOpenWidth, menuType, uniqueOpened, dualMenuShowText, menuOpen, getMenuTheme } =
    storeToRefs(settingStore)

  // 组件内部状态
  const defaultOpenedMenus = ref<string[]>([])
  const isMobileMode = ref(false)
  const showMobileModal = ref(false)

  // 使用 VueUse 的窗口尺寸监听
  const { width } = useWindowSize()

  // 菜单宽度相关
  const menuopenwidth = computed(() => getMenuOpenWidth.value)
  const menuclosewidth = computed(() => MENU_CLOSE_WIDTH)

  // 菜单类型判断
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)
  const showLeftMenu = computed(
    () => menuType.value === MenuTypeEnum.LEFT || menuType.value === MenuTypeEnum.TOP_LEFT
  )
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)

  // 移动端屏幕判断（使用 computed 避免重复计算）
  const isMobileScreen = computed(() => width.value < MOBILE_BREAKPOINT)

  // 路由相关
  const firstLevelMenuPath = computed(() => route.matched[0]?.path)
  const routerPath = computed(() => String(route.meta.activePath || route.path))

  // 额外的一级菜单项（按AI短剧制作流程顺序排列）
  const extraFirstLevelMenus = computed<AppRouteRecord[]>(() => [
    {
      path: '/dashboard',
      meta: { title: '仪表盘', icon: 'ri:pie-chart-line', isFirstLevel: true },
      children: [
        {
          path: '/dashboard/console',
          meta: { title: '工作台', icon: 'ri:home-4-line' },
          component: ''
        },
        {
          path: '/dashboard/usage',
          meta: { title: '使用统计', icon: 'ri:bar-chart-box-line' },
          component: ''
        },
        {
          path: '/dashboard/analysis',
          meta: { title: '数据分析', icon: 'ri:pie-chart-line' },
          component: ''
        },
        {
          path: '/dashboard/report',
          meta: { title: '报表生成', icon: 'ri:file-chart-line' },
          component: ''
        },
        {
          path: '/dashboard/data-dashboard',
          meta: { title: '数据看板', icon: 'ri:dashboard-line' },
          component: ''
        },
        {
          path: '/dashboard/ai-usage',
          meta: { title: 'AI用量统计', icon: 'ri:robot-2-line' },
          component: ''
        },
        {
          path: '/dashboard/cost',
          meta: { title: '成本分析', icon: 'ri:money-cny-circle-line' },
          component: ''
        }
      ]
    },
    {
      path: '/project',
      meta: { title: '项目管理', icon: 'ri:folder-3-line', isFirstLevel: true },
      children: [
        { path: '/project/list', meta: { title: '项目列表', icon: 'ri:list-check' }, component: '' },
        { path: '/project/edit', meta: { title: '项目编辑', icon: 'ri:edit-line' }, component: '' },
        {
          path: '/project/statistics',
          meta: { title: '项目统计', icon: 'ri:bar-chart-box-line' },
          component: ''
        }
      ]
    },
    {
      path: '/script',
      meta: { title: '剧本管理', icon: 'ri:file-list-3-line', isFirstLevel: true },
      children: [
        {
          path: '/script/library',
          meta: { title: '剧本管理', icon: 'ri:book-3-line' },
          component: ''
        },
        {
          path: '/script/write',
          meta: { title: '剧本编写', icon: 'ri:edit-line' },
          component: ''
        },
        {
          path: '/script/decompose',
          meta: { title: '剧本拆解', icon: 'ri:scissors-cut-line' },
          component: ''
        },
        {
          path: '/script/profiles',
          meta: { title: '人物小传', icon: 'ri:user-star-line' },
          component: ''
        },
        {
          path: '/script/ai-review',
          meta: { title: 'AI审核结果', icon: 'ri:robot-2-line' },
          component: ''
        },
        {
          path: '/script/version',
          meta: { title: '版本管理', icon: 'ri:history-line' },
          component: ''
        }
      ]
    },
    {
      path: '/storyboard',
      meta: { title: '分镜管理', icon: 'ri:layout-masonry-line', isFirstLevel: true },
      children: [
        {
          path: '/storyboard/design',
          meta: { title: '分镜设计', icon: 'ri:palette-line' },
          component: ''
        },
        {
          path: '/storyboard/plan',
          meta: { title: '镜头规划', icon: 'ri:camera-lens-line' },
          component: ''
        },
        {
          path: '/storyboard/scene',
          meta: { title: '场景编排', icon: 'ri:landscape-line' },
          component: ''
        },
        {
          path: '/storyboard/preview',
          meta: { title: '分镜预览', icon: 'ri:eye-line' },
          component: ''
        }
      ]
    },
    {
      path: '/video-gen',
      meta: { title: '视频生成', icon: 'ri:video-ai-line', isFirstLevel: true },
      children: [
        {
          path: '/video-gen/ai',
          meta: { title: 'AI视频生成', icon: 'ri:magic-line' },
          component: ''
        },
        {
          path: '/video-gen/task',
          meta: { title: '任务管理', icon: 'ri:task-line' },
          component: ''
        },
        {
          path: '/video-gen/preview',
          meta: { title: '视频预览', icon: 'ri:play-circle-line' },
          component: ''
        },
        {
          path: '/video-gen/history',
          meta: { title: '生成历史', icon: 'ri:history-line' },
          component: ''
        }
      ]
    },
    {
      path: '/editor',
      meta: { title: '剪辑工作台', icon: 'ri:scissors-cut-line', isFirstLevel: true },
      children: [
        {
          path: '/editor/edit-manage',
          meta: { title: '剪辑管理', icon: 'ri:film-line' },
          component: ''
        },
        {
          path: '/editor/timeline',
          meta: { title: '时间线编辑', icon: 'ri:time-line' },
          component: ''
        },
        {
          path: '/editor/export',
          meta: { title: '导出管理', icon: 'ri:download-line' },
          component: ''
        }
      ]
    },
    {
      path: '/review',
      meta: { title: '审核中心', icon: 'ri:shield-check-line', isFirstLevel: true },
      children: [
        {
          path: '/review/content',
          meta: { title: '内容审核', icon: 'ri:file-shield-line' },
          component: ''
        },
        { path: '/review/flow', meta: { title: '审批流程', icon: 'ri:flow-chart' }, component: '' },
        {
          path: '/review/pending',
          meta: { title: '待审列表', icon: 'ri:time-line' },
          component: ''
        },
        {
          path: '/review/detail',
          meta: { title: '审核详情', icon: 'ri:article-line' },
          component: ''
        }
      ]
    },
    {
      path: '/asset',
      meta: { title: '资产管理', icon: 'ri:folder-5-line', isFirstLevel: true },
      children: [
        {
          path: '/asset/upload',
          meta: { title: '素材上传', icon: 'ri:upload-cloud-line' },
          component: ''
        },
        {
          path: '/asset/category',
          meta: { title: '分类管理', icon: 'ri:folders-line' },
          component: ''
        },
        {
          path: '/asset/library',
          meta: { title: '资源库', icon: 'ri:database-2-line' },
          component: ''
        },
        {
          path: '/asset/reuse',
          meta: { title: '素材复用', icon: 'ri:recycle-line' },
          component: ''
        },
        {
          path: '/asset/image-generate',
          meta: { title: '图片生成', icon: 'ri:magic-line' },
          component: ''
        },
        {
          path: '/asset/image-tasks',
          meta: { title: '生成任务', icon: 'ri:task-line' },
          component: ''
        },
        {
          path: '/asset/image-models',
          meta: { title: '模型配置', icon: 'ri:settings-3-line' },
          component: ''
        }
      ]
    },
    {
      path: '/ai-process',
      meta: { title: 'AI处理记录', icon: 'ri:robot-2-line', isFirstLevel: true },
      children: [
        {
          path: '/ai-process/history',
          meta: { title: '处理历史', icon: 'ri:history-line' },
          component: ''
        },
        {
          path: '/ai-process/status',
          meta: { title: '状态追踪', icon: 'ri:loader-line' },
          component: ''
        }
      ]
    },
    {
      path: '/data-history',
      meta: { title: '数据历史', icon: 'ri:history-line', isFirstLevel: true },
      children: [
        {
          path: '/data-history/records',
          meta: { title: '修改记录', icon: 'ri:file-list-line' },
          component: ''
        },
        {
          path: '/data-history/rollback',
          meta: { title: '版本回退', icon: 'ri:rewind-line' },
          component: ''
        }
      ]
    },
    {
      path: '/workflow',
      meta: { title: '工作流管理', icon: 'ri:flow-chart-line', isFirstLevel: true },
      children: [
        {
          path: '/workflow/list',
          meta: { title: '工作流列表', icon: 'ri:list-check' },
          component: ''
        },
        {
          path: '/workflow/execute',
          meta: { title: '执行工作流', icon: 'ri:play-circle-line' },
          component: ''
        },
        {
          path: '/workflow/catalog',
          meta: { title: '工作流目录', icon: 'ri:folder-3-line' },
          component: ''
        }
      ]
    },
    {
      path: '/team',
      meta: { title: '团队管理', icon: 'ri:team-line', isFirstLevel: true },
      children: [
        {
          path: '/team/list',
          meta: { title: '团队列表', icon: 'ri:list-check' },
          component: ''
        },
        {
          path: '/team/members',
          meta: { title: '成员管理', icon: 'ri:user-settings-line' },
          component: ''
        },
        {
          path: '/team/roles',
          meta: { title: '角色管理', icon: 'ri:user-star-line' },
          component: ''
        },
        {
          path: '/team/invite-codes',
          meta: { title: '邀请码管理', icon: 'ri:vip-crown-line' },
          component: ''
        },
        {
          path: '/team/applications',
          meta: { title: '申请审批', icon: 'ri:file-shield-line' },
          component: ''
        },
        {
          path: '/team/quota',
          meta: { title: '资源配额', icon: 'ri:database-2-line' },
          component: ''
        },
        {
          path: '/team/settings',
          meta: { title: '团队设置', icon: 'ri:settings-3-line' },
          component: ''
        }
      ]
    },
    {
      path: '/points',
      meta: { title: '积分管理', icon: 'ri:coins-line', isFirstLevel: true },
      children: [
        {
          path: '/points/billing',
          meta: { title: '用量计费', icon: 'ri:calculator-line' },
          component: ''
        },
        {
          path: '/points/quota',
          meta: { title: '额度管理', icon: 'ri:wallet-3-line' },
          component: ''
        },
        {
          path: '/points/package',
          meta: { title: '套餐配置', icon: 'ri:vip-crown-line' },
          component: ''
        },
        {
          path: '/points/record',
          meta: { title: '消费记录', icon: 'ri:file-list-line' },
          component: ''
        }
      ]
    },
    {
      path: '/notice',
      meta: { title: '通知中心', icon: 'ri:notification-3-line', isFirstLevel: true },
      children: [
        {
          path: '/notice/push',
          meta: { title: '消息推送', icon: 'ri:send-plane-line' },
          component: ''
        },
        {
          path: '/notice/site',
          meta: { title: '站内通知', icon: 'ri:message-3-line' },
          component: ''
        },
        {
          path: '/notice/read',
          meta: { title: '已读管理', icon: 'ri:mail-check-line' },
          component: ''
        },
        {
          path: '/notice/remind',
          meta: { title: '提醒设置', icon: 'ri:alarm-warning-line' },
          component: ''
        }
      ]
    },
    {
      path: '/settings',
      meta: { title: '系统设置', icon: 'ri:settings-3-line', isFirstLevel: true },
      children: [
        {
          path: '/settings/user',
          meta: { title: '用户设置', icon: 'ri:user-settings-line' },
          component: ''
        },
        {
          path: '/settings/preference',
          meta: { title: '偏好配置', icon: 'ri:equalizer-line' },
          component: ''
        },
        {
          path: '/settings/account',
          meta: { title: '账号管理', icon: 'ri:account-circle-line' },
          component: ''
        },
        {
          path: '/settings/system',
          meta: { title: '系统参数', icon: 'ri:server-line' },
          component: ''
        }
      ]
    }
  ])

  // 菜单数据
  const firstLevelMenus = computed(() => {
    const menus = useMenuStore().menuList.filter((menu) => {
      if (menu.meta.isHide) return false
      if (menu.path === '/result' || menu.path === '/exception') return false
      return true
    })
    const extraPaths = new Set(extraFirstLevelMenus.value.map((m) => m.path))
    const filteredMenus = menus.filter((m) => !extraPaths.has(m.path))
    return [...filteredMenus, ...extraFirstLevelMenus.value]
  })

  // 功能模块子菜单配置（与 extraFirstLevelMenus 保持一致）
  const moduleSubMenus = computed<AppRouteRecord[]>(() => extraFirstLevelMenus.value)

  const menuList = computed(() => {
    const menuStore = useMenuStore()
    const allMenus = menuStore.menuList

    // 如果不是顶部左侧菜单或双列菜单，直接返回完整菜单列表
    if (!isTopLeftMenu.value && !isDualMenu.value) {
      return allMenus
    }

    // 处理 iframe 路径
    if (isIframe(route.path)) {
      return findIframeMenuList(route.path, allMenus)
    }

    // 处理一级菜单
    if (route.meta.isFirstLevel) {
      return []
    }

    // 返回当前顶级路径对应的子菜单
    const currentTopPath = `/${route.path.split('/')[1]}`
    const currentMenu = allMenus.find((menu) => menu.path === currentTopPath)
    if (currentMenu?.children && currentMenu.children.length > 0) {
      return currentMenu.children
    }

    // 查找功能模块的子菜单
    const moduleMenu = moduleSubMenus.value.find((menu) => menu.path === currentTopPath)
    return moduleMenu?.children ?? []
  })

  // 双列菜单收起时的滚动条样式
  const scrollbarStyle = computed(() => {
    const isCollapsed = isDualMenu.value && !menuOpen.value
    return {
      transform: isCollapsed ? 'translateY(-50px)' : 'translateY(0)',
      height: isCollapsed ? 'calc(100% + 50px)' : 'calc(100% - 60px)',
      transition: 'transform 0.3s ease'
    }
  })

  /**
   * 延迟隐藏移动端模态框（使用 VueUse 的 useTimeoutFn）
   */
  const { start: delayHideMobileModal } = useTimeoutFn(
    () => {
      showMobileModal.value = false
    },
    ANIMATION_DELAY,
    { immediate: false }
  )

  /**
   * 查找 iframe 对应的二级菜单列表
   */
  const findIframeMenuList = (currentPath: string, menuList: any[]) => {
    // 递归查找包含当前路径的菜单项
    const hasPath = (items: any[]): boolean => {
      for (const item of items) {
        if (item.path === currentPath) {
          return true
        }
        if (item.children && hasPath(item.children)) {
          return true
        }
      }
      return false
    }

    // 遍历一级菜单查找匹配的子菜单
    for (const menu of menuList) {
      if (menu.children && hasPath(menu.children)) {
        return menu.children
      }
    }
    return []
  }

  const { homePath } = useCommon()

  /**
   * 导航到首页
   */
  const navigateToHome = (): void => {
    router.push(homePath.value)
  }

  /**
   * 切换菜单显示/隐藏
   */
  const toggleMenuVisibility = (): void => {
    settingStore.setMenuOpen(!menuOpen.value)

    // 移动端模态框控制逻辑
    if (isMobileScreen.value) {
      if (!menuOpen.value) {
        // 菜单即将打开，立即显示模态框
        showMobileModal.value = true
      } else {
        // 菜单即将关闭，延迟隐藏模态框确保动画完成
        delayHideMobileModal()
      }
    }
  }

  /**
   * 处理菜单关闭（来自子组件）
   */
  const handleMenuClose = (): void => {
    if (isMobileScreen.value) {
      settingStore.setMenuOpen(false)
      delayHideMobileModal()
    }
  }

  /**
   * 处理模块点击（双列菜单左侧）
   * 点击后只展开右侧菜单显示子功能，不跳转页面
   */
  const handleModuleClick = (menu: AppRouteRecord): void => {
    // 如果有子菜单，只展开右侧菜单显示子功能，不跳转页面
    if (menu.children && menu.children.length > 0) {
      // 确保菜单展开
      if (!menuOpen.value) {
        settingStore.setMenuOpen(true)
      }
      // 使用 replace 而不是 push，避免历史记录堆积和404问题
      // 同时触发 menuList 更新以显示右侧子菜单
      router.replace(menu.children[0].path)
      return
    }

    // 没有子菜单则直接跳转
    handleMenuJump(menu, false)
  }

  /**
   * 切换双列菜单模式
   */
  const toggleDualMenuMode = (): void => {
    settingStore.setDualMenuShowText(!dualMenuShowText.value)
  }

  /**
   * 监听窗口尺寸变化，自动处理移动端菜单
   */
  watch(width, (newWidth) => {
    if (newWidth < MOBILE_BREAKPOINT) {
      settingStore.setMenuOpen(false)
      if (!menuOpen.value) {
        showMobileModal.value = false
      }
    } else {
      showMobileModal.value = false
    }
  })

  /**
   * 监听菜单开关状态变化
   */
  watch(menuOpen, (isMenuOpen: boolean) => {
    if (!isMobileScreen.value) {
      // 大屏幕设备上，模态框始终隐藏
      showMobileModal.value = false
    } else {
      // 小屏幕设备上，根据菜单状态控制模态框
      if (isMenuOpen) {
        // 菜单打开时立即显示模态框
        showMobileModal.value = true
      } else {
        // 菜单关闭时延迟隐藏模态框，确保动画完成
        delayHideMobileModal()
      }
    }
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>

<style lang="scss">
  @use './theme';

  .layout-sidebar {
    // 展开的宽度
    .el-menu:not(.el-menu--collapse) {
      width: v-bind(menuopenwidth);
    }

    // 折叠后宽度
    .el-menu--collapse {
      width: v-bind(menuclosewidth);
    }
  }
</style>
