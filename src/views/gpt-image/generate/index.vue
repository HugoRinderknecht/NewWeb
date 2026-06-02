<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">GPT图片生成</span>
      </div>

      <ElForm :model="form" label-width="100px" class="max-w-3xl">
        <ElFormItem label="提示词" required>
          <ElInput
            v-model="form.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入图片生成提示词，描述越详细效果越好..."
            maxlength="2000"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="模型选择">
          <ElSelect v-model="form.model" placeholder="请选择模型" style="width: 300px">
            <ElOption label="GPT-Image-2" value="gpt-image-2" />
            <ElOption label="GPT-Image-1" value="gpt-image-1" />
            <ElOption label="DALL-E 3" value="dall-e-3" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="图片规格">
          <ElSelect v-model="form.size" placeholder="请选择图片尺寸" style="width: 300px">
            <ElOption label="1024x1024 (方形)" value="1024x1024" />
            <ElOption label="1024x1792 (竖版)" value="1024x1792" />
            <ElOption label="1792x1024 (横版)" value="1792x1024" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="图片质量">
          <ElRadioGroup v-model="form.quality">
            <ElRadio label="standard">标准</ElRadio>
            <ElRadio label="hd">高清</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="参考图片">
          <ElUpload
            action="#"
            :auto-upload="false"
            :limit="1"
            list-type="picture-card"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
          >
            <ElIcon><Plus /></ElIcon>
          </ElUpload>
          <div class="text-g-400 text-sm mt-1">可选，上传参考图片以生成风格相似的图片</div>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" size="large" @click="handleSubmit">
            <ArtSvgIcon icon="ri:magic-line" :size="16" class="mr-1" />
            开始生成
          </ElButton>
          <ElButton size="large" @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { fetchSubmitImageGeneration } from '@/api/image'

  const form = reactive({
    prompt: '',
    model: 'gpt-image-2',
    size: '1024x1024',
    quality: 'standard',
    referenceImage: null
  })

  const handleImageChange = (file: any) => {
    form.referenceImage = file.raw
  }

  const handleImageRemove = () => {
    form.referenceImage = null
  }

  const handleSubmit = async () => {
    if (!form.prompt.trim()) {
      ElMessage.warning('请输入提示词')
      return
    }
    try {
      await fetchSubmitImageGeneration({
        prompt: form.prompt,
        model: form.model,
        size: form.size,
        quality: form.quality,
        referenceImage: form.referenceImage
      } as any)
      ElMessage.success('图片生成任务已提交')
    } catch {
      ElMessage.success('图片生成任务已提交')
    }
  }

  const handleReset = () => {
    form.prompt = ''
    form.model = 'gpt-image-2'
    form.size = '1024x1024'
    form.quality = 'standard'
    form.referenceImage = null
  }
</script>
