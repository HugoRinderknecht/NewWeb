<template>
  <div class="settings-security-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">账号安全</span>
            <ElTag type="info" size="small">密码、绑定与安全设置</ElTag>
          </div>
        </div>
      </template>

      <!-- 修改密码 -->
      <div class="settings-section mb-8">
        <h3 class="section-title">
          <ArtSvgIcon icon="ri:lock-password-line" class="mr-2" />
          修改密码
        </h3>
        <ElForm
          :model="passwordForm"
          label-width="120px"
          class="max-w-xl"
          :rules="passwordRules"
          ref="passwordFormRef"
        >
          <ElFormItem label="当前密码" prop="oldPassword">
            <ElInput
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            />
          </ElFormItem>
          <ElFormItem label="新密码" prop="newPassword">
            <ElInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
          </ElFormItem>
          <ElFormItem label="确认密码" prop="confirmPassword">
            <ElInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleChangePassword">
              <ArtSvgIcon icon="ri:save-line" class="mr-1" />
              修改密码
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <ElDivider />

      <!-- 账号绑定 -->
      <div class="settings-section mb-8">
        <h3 class="section-title">
          <ArtSvgIcon icon="ri:link-m" class="mr-2" />
          账号绑定
        </h3>
        <div class="bind-list space-y-4 max-w-xl">
          <div
            v-for="item in bindList"
            :key="item.type"
            class="bind-item flex-cb p-4 rounded-lg border"
            :class="item.bound ? 'border-success bg-success/5' : 'border-default'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                :class="item.bound ? 'bg-success text-white' : 'bg-fill-lighter text-g-400'"
              >
                <ArtSvgIcon :icon="item.icon" />
              </div>
              <div>
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-xs text-g-400">
                  {{ item.bound ? `已绑定: ${item.value}` : '未绑定' }}
                </div>
              </div>
            </div>
            <ElButton
              :type="item.bound ? 'danger' : 'primary'"
              size="small"
              @click="item.bound ? handleUnbind(item) : handleBind(item)"
            >
              {{ item.bound ? '解绑' : '绑定' }}
            </ElButton>
          </div>
        </div>
      </div>

      <ElDivider />

      <!-- 两步验证 -->
      <div class="settings-section mb-8">
        <h3 class="section-title">
          <ArtSvgIcon icon="ri:shield-keyhole-line" class="mr-2" />
          两步验证
        </h3>
        <div class="max-w-xl">
          <div class="flex items-center justify-between p-4 rounded-lg border border-default mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-lg"
              >
                <ArtSvgIcon icon="ri:smartphone-line" />
              </div>
              <div>
                <div class="font-medium">手机验证</div>
                <div class="text-xs text-g-400">登录时通过手机短信验证码验证身份</div>
              </div>
            </div>
            <ElSwitch
              v-model="twoFactor.phone"
              @change="(val: string | number | boolean) => handleToggle2FA('phone', val as boolean)"
            />
          </div>
          <div class="flex items-center justify-between p-4 rounded-lg border border-default mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-warning flex items-center justify-center text-white text-lg"
              >
                <ArtSvgIcon icon="ri:mail-line" />
              </div>
              <div>
                <div class="font-medium">邮箱验证</div>
                <div class="text-xs text-g-400">登录时通过邮箱验证码验证身份</div>
              </div>
            </div>
            <ElSwitch
              v-model="twoFactor.email"
              @change="(val: string | number | boolean) => handleToggle2FA('email', val as boolean)"
            />
          </div>
          <div class="flex items-center justify-between p-4 rounded-lg border border-default">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-success flex items-center justify-center text-white text-lg"
              >
                <ArtSvgIcon icon="ri:qr-code-line" />
              </div>
              <div>
                <div class="font-medium"> authenticator 验证</div>
                <div class="text-xs text-g-400">使用 Google Authenticator 等应用生成验证码</div>
              </div>
            </div>
            <ElSwitch
              v-model="twoFactor.authenticator"
              @change="
                (val: string | number | boolean) => handleToggle2FA('authenticator', val as boolean)
              "
            />
          </div>
        </div>
      </div>

      <ElDivider />

      <!-- 登录历史 -->
      <div class="settings-section">
        <h3 class="section-title">
          <ArtSvgIcon icon="ri:history-line" class="mr-2" />
          登录历史
        </h3>
        <ArtTable
          :data="loginHistoryList"
          :columns="historyColumns"
          :pagination="historyPagination"
          @pagination:size-change="handleHistorySizeChange"
          @pagination:current-change="handleHistoryCurrentChange"
        >
          <template #default>
            <ElTableColumn type="index" label="序号" width="70" align="center" />
            <ElTableColumn label="时间" width="160">
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <ArtSvgIcon icon="ri:time-line" class="text-g-400" />
                  <span>{{ row.time }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="设备" min-width="180">
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <ArtSvgIcon :icon="row.deviceIcon" class="text-g-400" />
                  <span>{{ row.device }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="ip" label="IP 地址" width="140" />
            <ElTableColumn prop="location" label="地点" width="140" />
            <ElTableColumn label="状态" width="100">
              <template #default="{ row }">
                <ElTag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </ElTag>
              </template>
            </ElTableColumn>
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <!-- 绑定弹窗 -->
    <ElDialog
      v-model="bindVisible"
      :title="`绑定${currentBindItem?.name}`"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm :model="bindForm" label-width="100px" :rules="bindRules" ref="bindFormRef">
        <ElFormItem :label="currentBindItem?.type === 'phone' ? '手机号' : '邮箱'" prop="account">
          <ElInput
            v-model="bindForm.account"
            :placeholder="`请输入${currentBindItem?.type === 'phone' ? '手机号' : '邮箱'}`"
          />
        </ElFormItem>
        <ElFormItem label="验证码" prop="code">
          <ElInput v-model="bindForm.code" placeholder="请输入验证码">
            <template #append>
              <ElButton @click="handleSendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </ElButton>
            </template>
          </ElInput>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="bindVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleBindSubmit">确认绑定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { fetchResetPassword, fetchGetUserInfo } from '@/api/auth'

  defineOptions({ name: 'SettingsSecurity' })

  interface BindItem {
    type: string
    name: string
    icon: string
    bound: boolean
    value: string
  }

  interface LoginHistoryItem {
    id: number
    time: string
    device: string
    deviceIcon: string
    ip: string
    location: string
    status: 'success' | 'failed'
  }

  const passwordFormRef = ref<FormInstance>()
  const bindFormRef = ref<FormInstance>()

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

  const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const passwordRules: FormRules = {
    oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
          if (value !== passwordForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  const bindList = ref<BindItem[]>([
    {
      type: 'phone',
      name: '手机号',
      icon: 'ri:smartphone-line',
      bound: true,
      value: '138****8888'
    },
    { type: 'email', name: '邮箱', icon: 'ri:mail-line', bound: true, value: 'u***@example.com' },
    { type: 'wechat', name: '微信', icon: 'ri:wechat-line', bound: false, value: '' },
    { type: 'github', name: 'GitHub', icon: 'ri:github-line', bound: false, value: '' }
  ])

  const twoFactor = reactive({
    phone: true,
    email: false,
    authenticator: false
  })

  const loginHistoryList = ref<LoginHistoryItem[]>([
    {
      id: 1,
      time: '2024-06-15 10:30',
      device: 'Chrome / Windows',
      deviceIcon: 'ri:computer-line',
      ip: '192.168.1.1',
      location: '上海',
      status: 'success'
    },
    {
      id: 2,
      time: '2024-06-14 18:45',
      device: 'Safari / macOS',
      deviceIcon: 'ri:macbook-line',
      ip: '192.168.1.2',
      location: '上海',
      status: 'success'
    },
    {
      id: 3,
      time: '2024-06-14 09:20',
      device: 'Chrome / Android',
      deviceIcon: 'ri:smartphone-line',
      ip: '192.168.1.3',
      location: '北京',
      status: 'success'
    },
    {
      id: 4,
      time: '2024-06-13 22:10',
      device: 'Firefox / Windows',
      deviceIcon: 'ri:computer-line',
      ip: '192.168.1.4',
      location: '广州',
      status: 'failed'
    },
    {
      id: 5,
      time: '2024-06-13 14:00',
      device: 'Chrome / macOS',
      deviceIcon: 'ri:macbook-line',
      ip: '192.168.1.5',
      location: '上海',
      status: 'success'
    },
    {
      id: 6,
      time: '2024-06-12 20:30',
      device: 'Safari / iOS',
      deviceIcon: 'ri:tablet-line',
      ip: '192.168.1.6',
      location: '深圳',
      status: 'success'
    },
    {
      id: 7,
      time: '2024-06-12 08:15',
      device: 'Edge / Windows',
      deviceIcon: 'ri:computer-line',
      ip: '192.168.1.7',
      location: '上海',
      status: 'success'
    },
    {
      id: 8,
      time: '2024-06-11 19:50',
      device: 'Chrome / Linux',
      deviceIcon: 'ri:computer-line',
      ip: '192.168.1.8',
      location: '杭州',
      status: 'failed'
    }
  ])

  const historyColumns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'time', label: '时间', width: 160 },
    { prop: 'device', label: '设备', minWidth: 180 },
    { prop: 'ip', label: 'IP 地址', width: 140 },
    { prop: 'location', label: '地点', width: 140 },
    { prop: 'status', label: '状态', width: 100 }
  ]

  const historyPagination = reactive({
    current: 1,
    size: 5,
    total: loginHistoryList.value.length
  })

  const bindVisible = ref(false)
  const currentBindItem = ref<BindItem | null>(null)
  const bindForm = reactive({
    account: '',
    code: ''
  })
  const bindRules: FormRules = {
    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }

  const countdown = ref(0)
  let timer: ReturnType<typeof setInterval>

  const handleChangePassword = async () => {
    if (!passwordFormRef.value) return
    await passwordFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await fetchResetPassword({
            email: userInfo.value.email || '',
            captchaCode: '',
            newPassword: passwordForm.newPassword
          })
          ElMessage.success('密码修改成功')
          passwordForm.oldPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
        } catch {
          ElMessage.error('密码修改失败')
        }
      }
    })
  }

  const handleBind = (item: BindItem) => {
    currentBindItem.value = item
    bindForm.account = ''
    bindForm.code = ''
    bindVisible.value = true
  }

  const handleUnbind = (item: BindItem) => {
    ElMessageBox.confirm(`确定要解绑${item.name}吗？`, '解绑确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const target = bindList.value.find((b) => b.type === item.type)
      if (target) {
        target.bound = false
        target.value = ''
      }
      ElMessage.success('解绑成功')
    })
  }

  const handleSendCode = () => {
    if (!bindForm.account) {
      ElMessage.warning('请先输入账号')
      return
    }
    ElMessage.success('验证码已发送')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }

  const handleBindSubmit = async () => {
    if (!bindFormRef.value) return
    await bindFormRef.value.validate((valid) => {
      if (valid) {
        const target = bindList.value.find((b) => b.type === currentBindItem.value?.type)
        if (target) {
          target.bound = true
          target.value = bindForm.account
        }
        ElMessage.success('绑定成功')
        bindVisible.value = false
      }
    })
  }

  const handleToggle2FA = (type: string, val: boolean) => {
    ElMessage.success(
      `${type === 'phone' ? '手机' : type === 'email' ? '邮箱' : 'Authenticator'}验证已${val ? '开启' : '关闭'}`
    )
  }

  const handleHistorySizeChange = (size: number) => {
    historyPagination.size = size
    historyPagination.current = 1
  }

  const handleHistoryCurrentChange = (current: number) => {
    historyPagination.current = current
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  onMounted(() => {
    loadUserInfo()
  })
</script>

<style lang="scss" scoped>
  .settings-security-page {
    height: 100%;

    .settings-section {
      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 20px;
      }
    }

    .bind-item {
      background: var(--el-bg-color);

      &.border-success {
        border-color: var(--el-color-success);
      }
    }
  }
</style>
