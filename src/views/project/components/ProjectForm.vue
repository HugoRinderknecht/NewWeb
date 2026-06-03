<template>
  <div>
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" class="max-w-xl">
      <ElFormItem label="项目名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入项目名称" maxlength="200" show-word-limit />
      </ElFormItem>
      <ElFormItem label="项目描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入项目描述"
          maxlength="2000"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="项目封面">
        <ElUpload
          class="cover-uploader"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleCoverChange"
        >
          <ElImage
            v-if="form.coverPreview"
            :src="form.coverPreview"
            class="cover-preview"
            fit="cover"
          />
          <div v-else class="cover-upload-trigger flex-cc">
            <ArtSvgIcon icon="ri:add-line" class="text-2xl text-g-400" />
            <span class="text-g-400 mt-1">上传封面</span>
          </div>
        </ElUpload>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'

  defineOptions({ name: 'ProjectForm' })

  interface Props {
    isCreate?: boolean
  }

  withDefaults(defineProps<Props>(), {
    isCreate: false
  })

  const formRef = ref<FormInstance>()

  const form = reactive({
    name: '',
    description: '',
    cover: null as File | null,
    coverPreview: ''
  })

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
    ]
  }

  const handleCoverChange = (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (raw) {
      form.cover = raw
      const reader = new FileReader()
      reader.onload = (e) => {
        form.coverPreview = (e.target?.result as string) || ''
      }
      reader.readAsDataURL(raw)
    }
  }

  const validate = async () => {
    if (!formRef.value) return false
    let valid = false
    await formRef.value.validate((v) => {
      valid = v
    })
    return valid
  }

  const reset = () => {
    form.name = ''
    form.description = ''
    form.cover = null
    form.coverPreview = ''
  }

  defineExpose({
    form,
    validate,
    reset
  })
</script>

<style lang="scss" scoped>
  .cover-uploader {
    :deep(.el-upload) {
      position: relative;
      width: 200px;
      height: 120px;
      overflow: hidden;
      cursor: pointer;
      border: 1px dashed var(--el-border-color);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .cover-preview {
    display: block;
    width: 200px;
    height: 120px;
    object-fit: cover;
  }

  .cover-upload-trigger {
    flex-direction: column;
    width: 200px;
    height: 120px;
  }
</style>
