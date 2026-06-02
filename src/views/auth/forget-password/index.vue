<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">忘记密码</h3>
          <p class="sub-title">通过邮箱验证重置您的密码</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleReset"
            style="margin-top: 25px"
          >
            <ElFormItem prop="email">
              <ElInput
                class="custom-height"
                placeholder="请输入注册时使用的邮箱"
                v-model.trim="formData.email"
              />
            </ElFormItem>
            <ElFormItem prop="captchaCode">
              <div class="flex w-full gap-2">
                <ElInput
                  class="custom-height flex-1"
                  placeholder="请输入验证码"
                  v-model.trim="formData.captchaCode"
                />
                <ElButton
                  class="custom-height"
                  type="primary"
                  plain
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                  :loading="sendingCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                </ElButton>
              </div>
            </ElFormItem>
            <ElFormItem prop="newPassword">
              <ElInput
                class="custom-height"
                placeholder="请输入新密码（8-100位，包含字母和数字）"
                v-model.trim="formData.newPassword"
                type="password"
                show-password
                autocomplete="new-password"
              />
            </ElFormItem>

            <p class="text-xs text-g-500 -mt-1 mb-2">密码需包含字母和数字，长度8-100位</p>

            <div style="margin-top: 15px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleReset"
                :loading="loading"
                v-ripple
              >
                重置密码
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-g-600">
              <span>想起密码了？</span>
              <RouterLink class="text-theme" :to="{ name: 'Login' }">返回登录</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchResetPassword, fetchEmailCaptcha } from '@/api/auth'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { BusinessCode } from '@/utils/http/status'
  import { isHttpError, HttpError, showSuccess } from '@/utils/http/error'

  defineOptions({ name: 'ForgetPassword' })

  const router = useRouter()

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const sendingCode = ref(false)
  const countdown = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const formData = reactive({
    email: '',
    captchaCode: '',
    newPassword: ''
  })

  const rules: FormRules = {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    captchaCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 8, max: 100, message: '密码长度在 8 到 100 个字符', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: any) => {
          if (!value) {
            callback()
            return
          }
          if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
            callback(new Error('密码必须包含字母和数字'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  const startCountdown = () => {
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
  }

  const showBusinessError = (error: Error) => {
    if (isHttpError(error)) {
      const httpError = error as HttpError
      const errorMap: Record<number, string> = {
        [BusinessCode.AUTH_EMAIL_CODE_INVALID]: '验证码错误',
        [BusinessCode.AUTH_EMAIL_CODE_EXPIRED]: '验证码已过期，请重新发送',
        [BusinessCode.AUTH_PASSWORD_WEAK]: '密码过于简单，请使用更复杂的密码',
        [BusinessCode.TOO_MANY_REQUESTS]: '操作过于频繁，请稍后重试'
      }
      ElMessage.error(errorMap[httpError.code] || httpError.message || '密码重置失败')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
  }

  const handleSendCode = async () => {
    if (!formRef.value) return
    await formRef.value.validateField('email')

    if (sendingCode.value || countdown.value > 0) return

    sendingCode.value = true
    try {
      await fetchEmailCaptcha(formData.email)
      showSuccess('验证码已发送到您的邮箱')
      startCountdown()
    } catch {
      ElMessage.error('验证码发送失败，请稍后重试')
    } finally {
      sendingCode.value = false
    }
  }

  const handleReset = async () => {
    if (!formRef.value) return
    await formRef.value.validate()
    loading.value = true

    try {
      await fetchResetPassword({
        email: formData.email,
        captchaCode: formData.captchaCode,
        newPassword: formData.newPassword
      })
      showSuccess('密码重置成功，请登录')
      router.push({ name: 'Login' })
    } catch (error) {
      if (error instanceof Error) {
        showBusinessError(error)
      }
    } finally {
      loading.value = false
    }
  }

  onUnmounted(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  })
</script>

<style scoped>
  @import '../login/style.css';
</style>
