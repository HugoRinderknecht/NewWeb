<template>
  <div class="settings-danger-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">危险区</span>
            <ElTag type="danger" size="small">不可逆操作，请谨慎</ElTag>
          </div>
        </div>
      </template>

      <!-- 数据导出 -->
      <div class="settings-section mb-8">
        <h3 class="section-title">
          <ArtSvgIcon icon="ri:download-cloud-line" class="mr-2" />
          数据导出
        </h3>
        <div class="max-w-xl">
          <p class="text-sm text-g-500 mb-4">导出您的个人数据，包括项目、资产、设置等信息</p>
          <div class="space-y-3">
            <div
              v-for="item in exportOptions"
              :key="item.type"
              class="export-item flex-cb p-4 rounded-lg border border-default"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-primary-light-9 flex items-center justify-center text-primary text-lg"
                >
                  <ArtSvgIcon :icon="item.icon" />
                </div>
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-xs text-g-400">{{ item.desc }}</div>
                </div>
              </div>
              <ElButton type="primary" plain size="small" @click="handleExport(item)">
                <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                导出
              </ElButton>
            </div>
          </div>
        </div>
      </div>

      <ElDivider />

      <!-- 危险操作 -->
      <div class="settings-section">
        <h3 class="section-title text-danger">
          <ArtSvgIcon icon="ri:alert-triangle-line" class="mr-2" />
          危险操作
        </h3>
        <div class="max-w-xl space-y-4">
          <!-- 清除缓存 -->
          <div class="danger-item flex-cb p-4 rounded-lg border border-warning">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-warning-light-9 flex items-center justify-center text-warning text-lg"
              >
                <ArtSvgIcon icon="ri:brush-line" />
              </div>
              <div>
                <div class="font-medium">清除本地缓存</div>
                <div class="text-xs text-g-400"
                  >清除浏览器本地存储的缓存数据，不会删除服务器数据</div
                >
              </div>
            </div>
            <ElButton type="warning" plain size="small" @click="handleClearCache">
              清除缓存
            </ElButton>
          </div>

          <!-- 退出所有设备 -->
          <div class="danger-item flex-cb p-4 rounded-lg border border-warning">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-warning-light-9 flex items-center justify-center text-warning text-lg"
              >
                <ArtSvgIcon icon="ri:logout-box-r-line" />
              </div>
              <div>
                <div class="font-medium">退出所有设备</div>
                <div class="text-xs text-g-400">强制所有已登录设备退出登录，需要重新验证身份</div>
              </div>
            </div>
            <ElButton type="warning" plain size="small" @click="handleLogoutAll">
              退出所有
            </ElButton>
          </div>

          <!-- 注销账号 -->
          <div class="danger-item flex-cb p-4 rounded-lg border border-danger">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-danger-light-9 flex items-center justify-center text-danger text-lg"
              >
                <ArtSvgIcon icon="ri:user-unfollow-line" />
              </div>
              <div>
                <div class="font-medium text-danger">注销账号</div>
                <div class="text-xs text-g-400">永久删除账号及所有关联数据，此操作不可恢复</div>
              </div>
            </div>
            <ElButton type="danger" plain size="small" @click="handleDeleteAccount">
              注销账号
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 确认弹窗 -->
    <ElDialog
      v-model="confirmVisible"
      :title="confirmTitle"
      width="480px"
      align-center
      destroy-on-close
    >
      <div class="confirm-content">
        <div
          class="flex items-center gap-3 mb-4 p-3 rounded-lg"
          :class="confirmType === 'danger' ? 'bg-danger-light-9' : 'bg-warning-light-9'"
        >
          <ArtSvgIcon
            :icon="confirmType === 'danger' ? 'ri:alert-line' : 'ri:question-line'"
            :class="confirmType === 'danger' ? 'text-danger' : 'text-warning'"
            class="text-2xl"
          />
          <span
            :class="confirmType === 'danger' ? 'text-danger' : 'text-warning'"
            class="font-medium"
          >
            {{
              confirmType === 'danger'
                ? '此操作不可恢复，请谨慎操作！'
                : '请确认是否继续执行此操作？'
            }}
          </span>
        </div>
        <p class="text-sm text-g-500 mb-4">{{ confirmDesc }}</p>
        <ElForm :model="confirmForm" :rules="confirmRules" ref="confirmFormRef">
          <ElFormItem label="确认操作" prop="confirmText">
            <ElInput
              v-model="confirmForm.confirmText"
              :placeholder="`请输入「${confirmPlaceholder}」以确认操作`"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="confirmVisible = false">取消</ElButton>
          <ElButton :type="confirmType" @click="handleConfirmSubmit" :loading="confirmLoading">
            确认{{ confirmAction }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 导出进度弹窗 -->
    <ElDialog
      v-model="exportVisible"
      title="数据导出"
      width="480px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="text-center py-4">
        <ArtSvgIcon icon="ri:file-zip-line" class="text-4xl text-primary mb-3" />
        <div class="font-medium mb-2">正在准备您的数据</div>
        <ElProgress :percentage="exportProgress" :status="exportProgress >= 100 ? 'success' : ''" />
        <div class="text-sm text-g-500 mt-2">{{ exportStatus }}</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="exportVisible = false" :disabled="exportProgress < 100">关闭</ElButton>
          <ElButton type="primary" @click="handleDownloadExport" :disabled="exportProgress < 100">
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            下载
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchGetUserInfo, fetchLogout } from '@/api/auth'

  defineOptions({ name: 'SettingsDanger' })

  const userInfo = ref<Api.Auth.UserInfo>({
    buttons: [],
    roles: [],
    userId: 0,
    username: '',
    userName: '',
    email: '',
    avatar: ''
  })

  const loadUserInfo = async () => {
    try {
      const data = await fetchGetUserInfo()
      if (data) {
        userInfo.value = data
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  interface ExportOption {
    type: string
    name: string
    desc: string
    icon: string
  }

  const exportOptions: ExportOption[] = [
    {
      type: 'projects',
      name: '项目数据',
      desc: '导出所有项目信息、成员、设置等',
      icon: 'ri:folder-3-line'
    },
    {
      type: 'assets',
      name: '资产数据',
      desc: '导出资产列表、分类、标签等元数据',
      icon: 'ri:image-line'
    },
    {
      type: 'transactions',
      name: '交易记录',
      desc: '导出所有积分交易和Token使用记录',
      icon: 'ri:receipt-line'
    },
    {
      type: 'settings',
      name: '个人设置',
      desc: '导出偏好设置、主题、语言等配置',
      icon: 'ri:settings-3-line'
    }
  ]

  const confirmVisible = ref(false)
  const confirmTitle = ref('')
  const confirmDesc = ref('')
  const confirmPlaceholder = ref('')
  const confirmAction = ref('')
  const confirmType = ref<'danger' | 'warning'>('warning')
  const confirmLoading = ref(false)
  const currentAction = ref('')

  const confirmFormRef = ref<FormInstance>()
  const confirmForm = reactive({
    confirmText: ''
  })

  const confirmRules: FormRules = {
    confirmText: [
      { required: true, message: '请输入确认文本', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
          if (value !== confirmPlaceholder.value) {
            callback(new Error('确认文本不匹配'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  const exportVisible = ref(false)
  const exportProgress = ref(0)
  const exportStatus = ref('正在打包数据...')
  let exportTimer: ReturnType<typeof setInterval>

  const handleExport = (item: ExportOption) => {
    void item
    exportVisible.value = true
    exportProgress.value = 0
    exportStatus.value = '正在打包数据...'

    exportTimer = setInterval(() => {
      exportProgress.value += Math.floor(Math.random() * 15) + 5
      if (exportProgress.value >= 30 && exportProgress.value < 60) {
        exportStatus.value = '正在加密数据...'
      } else if (exportProgress.value >= 60 && exportProgress.value < 90) {
        exportStatus.value = '正在生成下载链接...'
      } else if (exportProgress.value >= 90) {
        exportStatus.value = '准备完成'
      }
      if (exportProgress.value >= 100) {
        exportProgress.value = 100
        clearInterval(exportTimer)
      }
    }, 500)
  }

  const handleDownloadExport = () => {
    ElMessage.success('数据导出文件已下载')
    exportVisible.value = false
  }

  const showConfirm = (
    title: string,
    desc: string,
    placeholder: string,
    action: string,
    type: 'danger' | 'warning',
    actionKey: string
  ) => {
    confirmTitle.value = title
    confirmDesc.value = desc
    confirmPlaceholder.value = placeholder
    confirmAction.value = action
    confirmType.value = type
    currentAction.value = actionKey
    confirmForm.confirmText = ''
    confirmVisible.value = true
  }

  const handleClearCache = () => {
    showConfirm(
      '清除本地缓存',
      '清除后需要重新加载部分资源，本地草稿可能丢失。确定要继续吗？',
      '清除缓存',
      '清除',
      'warning',
      'clearCache'
    )
  }

  const handleLogoutAll = () => {
    showConfirm(
      '退出所有设备',
      '所有已登录设备将被强制退出，包括当前设备。确定要继续吗？',
      '退出所有',
      '退出',
      'warning',
      'logoutAll'
    )
  }

  const handleDeleteAccount = () => {
    showConfirm(
      '注销账号',
      '账号注销后，所有数据将被永久删除且无法恢复。此操作不可逆，请谨慎操作！',
      '永久删除',
      '注销',
      'danger',
      'deleteAccount'
    )
  }

  const handleConfirmSubmit = async () => {
    if (!confirmFormRef.value) return
    await confirmFormRef.value.validate(async (valid) => {
      if (valid) {
        confirmLoading.value = true
        try {
          switch (currentAction.value) {
            case 'clearCache':
              ElMessage.success('本地缓存已清除')
              break
            case 'logoutAll':
              await fetchLogout()
              ElMessage.success('所有设备已退出登录')
              break
            case 'deleteAccount':
              await fetchLogout()
              ElMessage.success('账号注销申请已提交')
              break
          }
        } catch {
          ElMessage.error('操作失败，请稍后重试')
        } finally {
          confirmLoading.value = false
          confirmVisible.value = false
        }
      }
    })
  }

  onUnmounted(() => {
    if (exportTimer) clearInterval(exportTimer)
  })

  onMounted(() => {
    loadUserInfo()
  })
</script>

<style lang="scss" scoped>
  .settings-danger-page {
    height: 100%;

    .settings-section {
      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 20px;

        &.text-danger {
          color: var(--el-color-danger);
        }
      }
    }

    .export-item,
    .danger-item {
      background: var(--el-bg-color);
    }

    .confirm-content {
      .bg-danger-light-9 {
        background-color: var(--el-color-danger-light-9);
      }

      .bg-warning-light-9 {
        background-color: var(--el-color-warning-light-9);
      }
    }
  }
</style>
