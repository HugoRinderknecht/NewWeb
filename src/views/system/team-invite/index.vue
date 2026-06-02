<template>
  <div class="team-invite-page">
    <h2 class="page-title">邀请成员</h2>

    <ElCard class="form-card">
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <ElFormItem label="邮箱/手机号" prop="contact">
          <ElInput v-model="form.contact" placeholder="请输入被邀请人邮箱或手机号" clearable />
        </ElFormItem>

        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="form.role" placeholder="请选择角色" clearable style="width: 100%">
            <ElOption label="成员" value="member" />
            <ElOption label="管理员" value="admin" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit">发送邀请</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchGetAdminInviteCodes, fetchCreateAdminInviteCode } from '@/api/platform-admin'
  import { useTeamStore } from '@/store/modules/team'

  defineOptions({ name: 'TeamInvite' })

  const teamStore = useTeamStore()
  const formRef = ref<FormInstance>()

  const form = reactive({
    contact: '',
    role: ''
  })

  const rules: FormRules = {
    contact: [{ required: true, message: '请输入邮箱或手机号', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const inviteCodes = ref<any[]>([])
  const loading = ref(false)

  const loadInviteCodes = async () => {
    const teamId = teamStore.currentTeamId
    if (!teamId) return
    loading.value = true
    try {
      const data = await fetchGetAdminInviteCodes(teamId, { current: 1, size: 20 } as any)
      if (data && data.records) {
        inviteCodes.value = data.records
      } else if (Array.isArray(data)) {
        inviteCodes.value = data
      }
    } catch {
      console.error('加载邀请码失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadInviteCodes()
  })

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        const teamId = teamStore.currentTeamId
        if (!teamId) {
          ElMessage.error('未选择团队')
          return
        }
        try {
          await fetchCreateAdminInviteCode(teamId)
          ElMessage.success('邀请已发送')
          handleReset()
          loadInviteCodes()
        } catch {
          ElMessage.error('邀请发送失败')
        }
      }
    })
  }

  const handleReset = () => {
    formRef.value?.resetFields()
  }
</script>

<style scoped>
  .team-invite-page {
    padding: 20px;
  }

  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
  }

  .form-card {
    max-width: 600px;
  }
</style>
