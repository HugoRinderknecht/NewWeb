<!-- 注册页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">注册账号</h3>
          <p class="sub-title">使用手机号创建新账号</p>
          <ElForm
            class="mt-7.5"
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            :key="formKey"
          >
            <ElFormItem prop="phone">
              <ElInput
                class="custom-height"
                v-model.trim="formData.phone"
                placeholder="请输入手机号"
              />
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                v-model.trim="formData.password"
                placeholder="请输入密码（8-100位，包含字母和数字）"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                class="custom-height"
                v-model.trim="formData.confirmPassword"
                placeholder="请确认密码"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="captchaCode">
              <div class="flex w-full gap-2">
                <ElInput
                  class="custom-height flex-1"
                  v-model.trim="formData.captchaCode"
                  placeholder="请输入验证码"
                  @keyup.enter="handleRegister"
                />
                <div
                  class="captcha-img cursor-pointer flex-shrink-0"
                  @click="refreshCaptcha"
                  v-loading="captchaLoading"
                >
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="h-full w-auto" />
                  <span v-else class="text-xs text-gray-400">点击获取</span>
                </div>
              </div>
            </ElFormItem>

            <div class="mb-4">
              <ElCheckbox v-model="autoLogin">注册后自动登录</ElCheckbox>
            </div>

            <ElFormItem prop="agreement">
              <ElCheckbox v-model="formData.agreement">
                我已阅读并同意
                <RouterLink
                  style="color: var(--theme-color); text-decoration: none"
                  to="/privacy-policy"
                  >隐私政策</RouterLink
                >
              </ElCheckbox>
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleRegister"
                :loading="loading"
                v-ripple
              >
                注册
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-g-600">
              <span>已有账号？</span>
              <RouterLink class="text-theme" :to="{ name: 'Login' }">去登录</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchRegister, fetchCaptcha, fetchGetUserInfo } from '@/api/auth'
  import { useUserStore } from '@/store/modules/user'
  import { BusinessCode } from '@/utils/http/status'
  import { isHttpError, HttpError, showSuccess } from '@/utils/http/error'

  defineOptions({ name: 'Register' })

  const router = useRouter()
  const userStore = useUserStore()
  const formRef = ref<FormInstance>()

  const loading = ref(false)
  const captchaLoading = ref(false)
  const formKey = ref(0)
  const captchaKey = ref('')
  const captchaImage = ref('')
  const autoLogin = ref(false)

  const formData = reactive({
    phone: '',
    password: '',
    confirmPassword: '',
    captchaCode: '',
    agreement: false
  })

  const rules = reactive<FormRules>({
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, max: 100, message: '密码长度在 8 到 100 个字符', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: any) => {
          if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
            callback(new Error('密码必须包含字母和数字'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: any) => {
          if (value !== formData.password) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
    agreement: [
      {
        validator: (_rule: any, value: boolean, callback: any) => {
          if (!value) {
            callback(new Error('请阅读并同意服务协议'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  })

  const showBusinessError = (error: Error) => {
    if (isHttpError(error)) {
      const httpError = error as HttpError
      const errorMap: Record<number, string> = {
        [BusinessCode.AUTH_PHONE_EXISTS]: '该手机号已被注册',
        [BusinessCode.AUTH_PASSWORD_WEAK]: '密码过于简单，请使用更复杂的密码',
        [BusinessCode.AUTH_CAPTCHA_INVALID]: '验证码错误，请重新输入',
        [BusinessCode.AUTH_CAPTCHA_EXPIRED]: '验证码已过期，请刷新',
        [BusinessCode.AUTH_REGISTER_FAILED]: '注册失败，请稍后重试',
        [BusinessCode.TOO_MANY_REQUESTS]: '操作过于频繁，请稍后重试'
      }
      ElMessage.error(errorMap[httpError.code] || httpError.message || '注册失败')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
  }

  const refreshCaptcha = async () => {
    try {
      captchaLoading.value = true
      const data = await fetchCaptcha()
      captchaKey.value = data.key || data.captchaKey || ''
      captchaImage.value = data.image || data.captchaImage || ''
    } catch (error) {
      console.error('获取验证码失败:', error)
    } finally {
      captchaLoading.value = false
    }
  }

  const handleRegister = async () => {
    const formRefInstance = unref(formRef)
    await formRefInstance?.validate()
    loading.value = true

    try {
      const params: Api.Auth.RegisterParams = {
        phone: formData.phone,
        password: formData.password,
        captchaKey: captchaKey.value,
        captchaCode: formData.captchaCode,
        autoLogin: autoLogin.value
      }

      const response = await fetchRegister(params)

      if (autoLogin.value && response.token) {
        userStore.setToken(response.token, response.refreshToken)
        userStore.setLoginStatus(true)
        const userInfo = await fetchGetUserInfo()
        userStore.setUserInfo(userInfo)
        showSuccess('注册成功')
        router.replace('/dashboard/console')
      } else {
        showSuccess('注册成功')
        router.push({ name: 'Login' })
      }
    } catch (error) {
      if (error instanceof Error) {
        showBusinessError(error)
      }
      await refreshCaptcha()
      formData.captchaCode = ''
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refreshCaptcha()
  })
</script>

<style scoped>
  @import '../login/style.css';

  .captcha-img {
    width: 120px;
    height: 40px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
  }
</style>
