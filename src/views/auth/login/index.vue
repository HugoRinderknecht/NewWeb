<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">欢迎登录</h3>
          <p class="sub-title">请输入您的账号和密码</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleLogin"
            style="margin-top: 25px"
          >
            <ElFormItem prop="account">
              <ElInput
                class="custom-height"
                placeholder="请输入用户名/邮箱/手机号"
                v-model.trim="formData.account"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                placeholder="请输入密码"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>
            <!-- <ElFormItem prop="captchaCode">
              <div class="flex w-full gap-2">
                <ElInput
                  class="custom-height flex-1"
                  placeholder="请输入验证码"
                  v-model.trim="formData.captchaCode"
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
            </ElFormItem> -->

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">记住密码</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">忘记密码</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleLogin"
                :loading="loading"
                v-ripple
              >
                登录
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>还没有账号？</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">立即注册</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { useUserStore } from '@/store/modules/user'
  import { useMenuStore } from '@/store/modules/menu'
  import { HttpError, isHttpError } from '@/utils/http/error'
  import { BusinessCode } from '@/utils/http/status'
  import { fetchLogin, fetchGetUserInfo } from '@/api/auth'
  import { getFirstMenuPath } from '@/utils'
  import { HOME_PAGE_PATH } from '@/router'
  import { type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'Login' })

  const userStore = useUserStore()
  const menuStore = useMenuStore()
  const router = useRouter()
  const route = useRoute()

  const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()

  const loading = ref(false)

  const formData = reactive({
    account: '',
    password: '',
    captchaCode: '',
    rememberPassword: false
  })

  const rules: FormRules = {
    account: [
      { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' },
      { min: 2, max: 100, message: '账号长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, max: 100, message: '密码长度在 8 到 100 个字符', trigger: 'blur' }
    ]
    // captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }

  const showBusinessError = (error: Error) => {
    if (isHttpError(error)) {
      const httpError = error as HttpError
      const errorMap: Record<number, string> = {
        [BusinessCode.AUTH_INVALID_CREDENTIALS]: '账号或密码错误',
        [BusinessCode.AUTH_ACCOUNT_LOCKED]: '账户已被锁定，请稍后重试',
        [BusinessCode.AUTH_ACCOUNT_DISABLED]: '账户已被禁用，请联系管理员',
        [BusinessCode.AUTH_CAPTCHA_INVALID]: '验证码错误，请重新输入',
        [BusinessCode.AUTH_CAPTCHA_EXPIRED]: '验证码已过期，请刷新',
        [BusinessCode.AUTH_LOGIN_FAILED]: '登录失败，请稍后重试',
        [BusinessCode.TOO_MANY_REQUESTS]: '操作过于频繁，请稍后重试'
      }
      ElMessage.error(errorMap[httpError.code] || httpError.message || '登录失败')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
  }

  const handleLogin = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    loading.value = true

    try {
      const { token, refreshToken } = await fetchLogin({
        account: formData.account,
        password: formData.password
        // captchaKey: captchaKey.value,
        // captchaCode: formData.captchaCode
      })

      userStore.setToken(token, refreshToken)
      userStore.setLoginStatus(true)

      const userInfo = await fetchGetUserInfo()
      userStore.setUserInfo(userInfo)

      setTimeout(() => {
        ElNotification({
          title: '登录成功',
          type: 'success',
          duration: 2500,
          zIndex: 10000,
          message: `欢迎回来, ${systemName}!`
        })
      }, 1000)

      const redirect = route.query.redirect as string
      if (redirect) {
        router.push(redirect)
      } else {
        router.push(getFirstMenuPath(menuStore.menuList) || HOME_PAGE_PATH || '/')
      }
    } catch (error) {
      if (error instanceof Error) {
        showBusinessError(error)
      }
      // await refreshCaptcha()
      // formData.captchaCode = ''
    } finally {
      loading.value = false
    }
  }

  // onMounted(() => {
  //   refreshCaptcha()
  // })
</script>

<style scoped>
  @import './style.css';

  .captcha-img {
    width: 120px;
    height: 40px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background: #f5f7fa;
  }
</style>
