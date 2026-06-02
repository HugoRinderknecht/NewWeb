<template>
  <div>
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" class="max-w-xl">
      <ElFormItem label="项目名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入项目名称" maxlength="50" show-word-limit />
      </ElFormItem>
      <ElFormItem label="项目描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入项目描述"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="项目类型" prop="type">
        <ElSelect v-model="form.type" placeholder="请选择项目类型" style="width: 100%">
          <ElOption label="动画制作" value="animation" />
          <ElOption label="视频制作" value="video" />
          <ElOption label="音频制作" value="audio" />
          <ElOption label="分镜管理" value="storyboard" />
          <ElOption label="剧本管理" value="script" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="负责人" prop="manager">
        <ElInput v-model="form.manager" placeholder="请输入负责人姓名" />
      </ElFormItem>
      <ElFormItem v-if="!isCreate" label="项目状态">
        <ElSelect v-model="form.status" placeholder="请选择项目状态" style="width: 100%">
          <ElOption label="进行中" value="progress" />
          <ElOption label="已完成" value="completed" />
          <ElOption label="已暂停" value="paused" />
          <ElOption label="已归档" value="archived" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="!isCreate" label="项目进度">
        <ElSlider v-model="form.progress" :max="100" show-input />
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
      <ElFormItem label="项目设置">
        <ElSpace>
          <ElCheckbox v-model="form.isPublic">公开项目</ElCheckbox>
          <ElCheckbox v-model="form.enableNotify">开启通知</ElCheckbox>
        </ElSpace>
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
    type: '',
    manager: '',
    status: 'progress',
    progress: 0,
    cover: '',
    coverPreview: '',
    isPublic: true,
    enableNotify: true
  })

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
    manager: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }]
  }

  const handleCoverChange = (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.coverPreview = (e.target?.result as string) || ''
        form.cover = form.coverPreview
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
    form.type = ''
    form.manager = ''
    form.status = 'progress'
    form.progress = 0
    form.cover = ''
    form.coverPreview = ''
    form.isPublic = true
    form.enableNotify = true
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
      border: 1px dashed var(--el-border-color);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
      width: 200px;
      height: 120px;

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .cover-preview {
    width: 200px;
    height: 120px;
    display: block;
    object-fit: cover;
  }

  .cover-upload-trigger {
    width: 200px;
    height: 120px;
    flex-direction: column;
  }
</style>
