<template>
  <div class="settings-account-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">账号管理</span>
        </div>
      </template>
      <ElForm :model="form" label-width="120px" class="max-w-2xl">
        <ElFormItem label="当前密码">
          <ElInput v-model="form.oldPassword" type="password" placeholder="请输入当前密码" />
        </ElFormItem>
        <ElFormItem label="新密码">
          <ElInput v-model="form.newPassword" type="password" placeholder="请输入新密码" />
        </ElFormItem>
        <ElFormItem label="确认密码">
          <ElInput v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleChangePassword">修改密码</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import {
    fetchGetUserInfo,
    fetchUpdateProfile,
    fetchUploadAvatar,
    fetchResetPassword
  } from '@/api/auth'

  defineOptions({ name: 'SettingsAccount' })

  const userInfo = ref<Api.Auth.UserInfo>({
    buttons: [],
    roles: [],
    userId: 0,
    username: '',
    userName: '',
    email: '',
    avatar: ''
  })

  const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const loading = ref(false)

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

  const handleChangePassword = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      ElMessage.warning('请填写完整密码信息')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致')
      return
    }
    loading.value = true
    try {
      await fetchResetPassword({
        email: userInfo.value.email || '',
        captchaCode: '',
        newPassword: form.newPassword
      })
      ElMessage.success('密码修改成功')
      form.oldPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    } catch {
      ElMessage.error('密码修改失败')
    } finally {
      loading.value = false
    }
  }

  const handleUpdateProfile = async (params: Api.Auth.UpdateProfileParams) => {
    try {
      const data = await fetchUpdateProfile(params)
      if (data) {
        // 更新用户名变更后的token
        if (data.token) {
          const userStore = (await import('@/store/modules/user')).useUserStore()
          userStore.setToken(data.token, data.refreshToken)
        }
        // 重新获取完整用户信息
        await loadUserInfo()
      }
      ElMessage.success('信息修改成功')
    } catch {
      ElMessage.error('信息修改失败')
    }
  }

  const handleUploadAvatar = async (file: File) => {
    try {
      const data = await fetchUploadAvatar(file)
      if (data) {
        userInfo.value = data
      }
      ElMessage.success('头像上传成功')
    } catch {
      ElMessage.error('头像上传失败')
    }
  }

  defineExpose({
    handleUpdateProfile,
    handleUploadAvatar
  })

  onMounted(() => {
    loadUserInfo()
  })
</script>
