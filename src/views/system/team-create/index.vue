<template>
  <div class="team-create-page">
    <h2 class="page-title">创建团队</h2>

    <ElCard class="form-card">
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <ElFormItem label="团队名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入团队名称" clearable />
        </ElFormItem>

        <ElFormItem label="团队描述" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入团队描述"
            clearable
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit">创建</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchCreateAdminTeam } from '@/api/platform-admin'

  defineOptions({ name: 'TeamCreate' })

  const formRef = ref<FormInstance>()

  const form = reactive({
    name: '',
    description: ''
  })

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入团队名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入团队描述', trigger: 'blur' },
      { max: 200, message: '长度不超过 200 个字符', trigger: 'blur' }
    ]
  }

  const router = useRouter()

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await fetchCreateAdminTeam({
            teamName: form.name,
            description: form.description
          })
          ElMessage.success('创建成功')
          router.push('/team')
        } catch {
          ElMessage.error('创建失败')
        }
      }
    })
  }

  const handleReset = () => {
    formRef.value?.resetFields()
  }
</script>

<style scoped>
  .team-create-page {
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
