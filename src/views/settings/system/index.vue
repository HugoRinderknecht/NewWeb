<template>
  <div class="settings-system-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">系统参数</span>
          <ElButton type="primary" @click="handleSave">保存参数</ElButton>
        </div>
      </template>
      <ElForm :model="form" label-width="150px" class="max-w-2xl">
        <ElFormItem label="系统名称">
          <ElInput v-model="form.systemName" placeholder="请输入系统名称" />
        </ElFormItem>
        <ElFormItem label="Logo">
          <ElInput v-model="form.logo" placeholder="请输入Logo URL" />
        </ElFormItem>
        <ElFormItem label="版权信息">
          <ElInput v-model="form.copyright" placeholder="请输入版权信息" />
        </ElFormItem>
        <ElFormItem label="最大上传大小">
          <ElInputNumber v-model="form.maxUploadSize" :min="1" :max="1000" />
          <span class="ml-2">MB</span>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { fetchGetConfigList, fetchUpdateConfig } from '@/api/system-config'

  defineOptions({ name: 'SettingsSystem' })

  const form = reactive({
    systemName: '',
    logo: '',
    copyright: '',
    maxUploadSize: 100
  })

  const configKeyMap: Record<string, keyof typeof form> = {
    'site.name': 'systemName',
    'site.logo': 'logo',
    'site.copyright': 'copyright',
    'upload.maxSize': 'maxUploadSize'
  }

  const loading = ref(false)

  const loadConfig = async () => {
    try {
      const data = await fetchGetConfigList()
      if (data) {
        data.forEach((item: any) => {
          const formKey = configKeyMap[item.key]
          if (formKey) {
            if (formKey === 'maxUploadSize') {
              form[formKey] = Number(item.value) || 100
            } else {
              ;(form as any)[formKey] = item.value
            }
          }
        })
      }
    } catch (error) {
      console.error('加载系统配置失败:', error)
    }
  }

  const handleSave = async () => {
    loading.value = true
    try {
      const updates: Record<string, string> = {
        'site.name': form.systemName,
        'site.logo': form.logo,
        'site.copyright': form.copyright,
        'upload.maxSize': String(form.maxUploadSize)
      }
      await Promise.all(
        Object.entries(updates).map(([key, value]) => fetchUpdateConfig(key, { value }))
      )
      ElMessage.success('系统参数保存成功')
    } catch {
      ElMessage.error('系统参数保存失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadConfig()
  })
</script>
