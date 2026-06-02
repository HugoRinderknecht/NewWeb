<!-- 新用户引导弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :width="isMobile ? '92%' : '520px'"
    :close-on-click-modal="false"
    :close-on-press-escape="canSkip"
    :show-close="canSkip"
    :destroy-on-close="true"
    align-center
    class="onboarding-dialog"
    @close="handleDialogClose"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-icon">
          <ArtSvgIcon icon="ri:rocket-line" class="text-2xl text-primary" />
        </div>
        <h3 class="header-title">{{ headerTitle }}</h3>
        <p class="header-subtitle">{{ headerSubtitle }}</p>
      </div>
    </template>

    <!-- 步骤条 -->
    <ElSteps
      v-if="mode === 'full'"
      :active="currentStep"
      finish-status="success"
      simple
      class="onboarding-steps"
    >
      <ElStep title="基本信息" />
      <ElStep title="邀请码" />
    </ElSteps>

    <!-- 步骤一：基本信息 -->
    <Transition name="step-slide" mode="out-in">
      <div v-if="currentStep === 0" key="basic-info" class="step-content">
        <ElForm
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          label-position="top"
          class="onboarding-form"
        >
          <!-- 头像上传 -->
          <ElFormItem label="头像" class="avatar-form-item">
            <div class="avatar-upload-wrapper">
              <ElUpload
                :auto-upload="false"
                :show-file-list="false"
                accept="image/jpeg,image/png,image/gif,image/webp"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarChange"
              >
                <div class="avatar-upload-trigger">
                  <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview" />
                  <div v-else class="avatar-placeholder">
                    <ArtSvgIcon icon="ri:camera-line" class="text-xl text-g-400" />
                  </div>
                  <div class="avatar-upload-overlay">
                    <ArtSvgIcon icon="ri:edit-line" class="text-white text-lg" />
                  </div>
                </div>
              </ElUpload>
              <span class="avatar-tip">支持 JPG/PNG/GIF/WebP，不超过 2MB</span>
            </div>
          </ElFormItem>

          <!-- 用户名 -->
          <ElFormItem label="用户名" prop="username">
            <ElInput
              v-model.trim="basicForm.username"
              placeholder="请输入用户名（3-50位）"
              maxlength="50"
              show-word-limit
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:user-line" class="text-g-400" />
              </template>
            </ElInput>
          </ElFormItem>

          <!-- 邮箱 -->
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model.trim="basicForm.email" placeholder="请输入邮箱地址" maxlength="254">
              <template #prefix>
                <ArtSvgIcon icon="ri:mail-line" class="text-g-400" />
              </template>
            </ElInput>
          </ElFormItem>
        </ElForm>
      </div>
    </Transition>

    <!-- 步骤二：邀请码 -->
    <Transition name="step-slide" mode="out-in">
      <div v-if="currentStep === 1" key="invite-code" class="step-content">
        <ElForm
          ref="inviteFormRef"
          :model="inviteForm"
          label-position="top"
          class="onboarding-form"
        >
          <!-- 团队邀请码 -->
          <ElFormItem label="团队邀请码">
            <ElInput
              v-model.trim="inviteForm.teamCode"
              placeholder="请输入团队邀请码"
              maxlength="20"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:team-line" class="text-g-400" />
              </template>
            </ElInput>
            <div class="field-tip">输入团队邀请码可加入已有团队</div>
          </ElFormItem>

          <!-- 平台邀请码 -->
          <ElFormItem label="平台邀请码">
            <ElInput
              v-model.trim="inviteForm.platformCode"
              placeholder="请输入平台邀请码"
              maxlength="20"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:vip-crown-line" class="text-g-400" />
              </template>
            </ElInput>
            <div class="field-tip">输入平台邀请码可获取专属权益</div>
          </ElFormItem>
        </ElForm>
      </div>
    </Transition>

    <template #footer>
      <div class="dialog-footer">
        <!-- 步骤一按钮 -->
        <template v-if="currentStep === 0">
          <ElButton type="primary" :loading="submitting" @click="handleNextStep"> 下一步 </ElButton>
        </template>

        <!-- 步骤二按钮 -->
        <template v-if="currentStep === 1">
          <ElButton @click="handleSkip">跳过</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit"> 完成 </ElButton>
        </template>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { fetchUpdateProfile, fetchUploadAvatar, fetchRedeemPlatformCode } from '@/api/auth'
  import { fetchJoinByCode } from '@/api/team'
  import { useUserStore } from '@/store/modules/user'
  import { validateEmail } from '@/utils/form/validator'
  import { showSuccess } from '@/utils/http/error'

  defineOptions({ name: 'OnboardingDialog' })

  interface Props {
    /** 弹窗模式：full=完整两步引导，inviteOnly=仅邀请码步骤 */
    mode?: 'full' | 'inviteOnly'
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'full'
  })

  const emit = defineEmits<{
    (e: 'complete'): void
    (e: 'skip'): void
  }>()

  const userStore = useUserStore()

  const dialogVisible = ref(false)
  const currentStep = ref(0)
  const submitting = ref(false)
  const avatarPreview = ref('')
  const avatarFile = ref<File | null>(null)

  const basicFormRef = ref<FormInstance>()
  const inviteFormRef = ref<FormInstance>()

  const basicForm = reactive({
    username: '',
    email: ''
  })

  const inviteForm = reactive({
    teamCode: '',
    platformCode: ''
  })

  // 响应式判断
  const isMobile = computed(() => window.innerWidth < 640)

  // 是否可跳过（步骤一不可跳过，步骤二可跳过）
  const canSkip = computed(() => currentStep.value === 1 || props.mode === 'inviteOnly')

  // 头部标题
  const headerTitle = computed(() => {
    if (props.mode === 'inviteOnly') return '加入团队'
    return currentStep.value === 0 ? '完善个人信息' : '填写邀请码'
  })

  const headerSubtitle = computed(() => {
    if (props.mode === 'inviteOnly') return '输入邀请码加入团队，或跳过此步骤'
    return currentStep.value === 0 ? '完善您的个人信息，开始使用平台' : '填写邀请码加入团队（可选）'
  })

  // 用户名验证规则（3-50字符，支持中英文）
  const usernameValidator = (_rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error('请输入用户名'))
      return
    }
    if (value.length < 3 || value.length > 50) {
      callback(new Error('用户名长度为3-50个字符'))
      return
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_]*$/.test(value)) {
      callback(new Error('用户名仅支持中文、字母、数字和下划线'))
      return
    }
    callback()
  }

  // 邮箱验证规则
  const emailValidator = (_rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error('请输入邮箱'))
      return
    }
    if (!validateEmail(value)) {
      callback(new Error('请输入正确的邮箱格式'))
      return
    }
    callback()
  }

  const basicRules = reactive<FormRules>({
    username: [{ required: true, validator: usernameValidator, trigger: 'blur' }],
    email: [{ required: true, validator: emailValidator, trigger: 'blur' }]
  })

  /** 头像上传前校验 */
  const beforeAvatarUpload = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      ElMessage.error('头像仅支持 JPG/PNG/GIF/WebP 格式')
      return false
    }
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('头像大小不能超过 2MB')
      return false
    }
    return true
  }

  /** 头像选择变更 */
  const handleAvatarChange = (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (!raw) return
    if (!beforeAvatarUpload(raw)) return

    avatarFile.value = raw
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(raw)
  }

  /** 下一步（步骤一 → 步骤二） */
  const handleNextStep = async () => {
    const formRef = unref(basicFormRef)
    if (!formRef) return

    try {
      await formRef.validate()
      submitting.value = true

      // 上传头像（如有）
      if (avatarFile.value) {
        try {
          const avatarData = await fetchUploadAvatar(avatarFile.value)
          if (avatarData) {
            userStore.setUserInfo(avatarData)
          }
        } catch {
          ElMessage.warning('头像上传失败，其他信息将继续保存')
        }
      }

      // 提交基本信息（返回LoginVO，用户名变更时会包含新token）
      const profileData = await fetchUpdateProfile({
        username: basicForm.username,
        email: basicForm.email
      })
      if (profileData) {
        // 如果返回了新token，更新本地存储
        if (profileData.token) {
          userStore.setToken(profileData.token, profileData.refreshToken)
        }
        // 更新用户信息
        userStore.setUserInfo({
          ...userStore.info,
          username: profileData.username || basicForm.username,
          email: profileData.email || basicForm.email,
          avatar: profileData.avatar || userStore.info?.avatar
        } as Api.Auth.UserInfo)
      }

      showSuccess('基本信息保存成功')
      currentStep.value = 1
    } catch {
      // 表单验证未通过
    } finally {
      submitting.value = false
    }
  }

  /** 提交邀请码 */
  const handleSubmit = async () => {
    submitting.value = true
    try {
      // 处理团队邀请码
      if (inviteForm.teamCode) {
        try {
          await fetchJoinByCode(inviteForm.teamCode)
          showSuccess('已成功加入团队')
        } catch {
          ElMessage.error('团队邀请码无效，请检查后重试')
          return
        }
      }

      // 处理平台邀请码
      if (inviteForm.platformCode) {
        try {
          await fetchRedeemPlatformCode(inviteForm.platformCode)
          showSuccess('平台邀请码已激活')
        } catch {
          ElMessage.error('平台邀请码无效，请检查后重试')
          return
        }
      }

      // 标记引导完成
      markOnboardingCompleted()
      dialogVisible.value = false
      emit('complete')
    } finally {
      submitting.value = false
    }
  }

  /** 跳过邀请码步骤 */
  const handleSkip = () => {
    markOnboardingCompleted()
    dialogVisible.value = false
    emit('skip')
  }

  /** 弹窗关闭处理 */
  const handleDialogClose = () => {
    // 步骤一不允许关闭，此回调仅在步骤二触发
    if (currentStep.value === 0 && props.mode === 'full') {
      dialogVisible.value = true
      return
    }
    markOnboardingCompleted()
  }

  /** 标记引导流程已完成 */
  const markOnboardingCompleted = () => {
    const userId = userStore.info?.userId
    if (userId) {
      localStorage.setItem(`onboarding-completed-${userId}`, Date.now().toString())
    }
  }

  /** 检查引导是否已完成 */
  const isOnboardingCompleted = (): boolean => {
    const userId = userStore.info?.userId
    if (!userId) return false
    return !!localStorage.getItem(`onboarding-completed-${userId}`)
  }

  /** 打开弹窗（外部调用） */
  const open = () => {
    if (isOnboardingCompleted()) return

    // 根据模式设置初始步骤
    if (props.mode === 'inviteOnly') {
      currentStep.value = 1
    } else {
      currentStep.value = 0
    }

    // 预填已有信息
    if (userStore.info) {
      basicForm.username = userStore.info.username || ''
      basicForm.email = userStore.info.email || ''
      if (userStore.info.avatar) {
        avatarPreview.value = userStore.info.avatar
      }
    }

    dialogVisible.value = true
  }

  defineExpose({ open, isOnboardingCompleted })
</script>

<style lang="scss" scoped>
  .onboarding-dialog {
    :deep(.el-dialog__header) {
      padding-bottom: 0;
    }

    :deep(.el-dialog__body) {
      padding-top: 16px;
    }
  }

  .dialog-header {
    text-align: center;
    padding: 8px 0 4px;

    .header-icon {
      width: 48px;
      height: 48px;
      background: var(--el-color-primary-light-9);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px;
      color: var(--el-text-color-primary);
    }

    .header-subtitle {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }

  .onboarding-steps {
    margin-bottom: 20px;

    :deep(.el-step__title) {
      font-size: 13px;
    }
  }

  .step-content {
    min-height: 200px;
  }

  // 步骤切换动画
  .step-slide-enter-active,
  .step-slide-leave-active {
    transition: all 0.3s ease;
  }

  .step-slide-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }

  .step-slide-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }

  // 头像上传
  .avatar-form-item {
    :deep(.el-form-item__content) {
      justify-content: center;
    }
  }

  .avatar-upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .avatar-upload-trigger {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 2px dashed var(--el-border-color);
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary);

      .avatar-upload-overlay {
        opacity: 1;
      }
    }
  }

  .avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-light);
  }

  .avatar-upload-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .avatar-tip {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  // 表单样式
  .onboarding-form {
    .field-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
      line-height: 1.4;
    }
  }

  // 底部按钮
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
