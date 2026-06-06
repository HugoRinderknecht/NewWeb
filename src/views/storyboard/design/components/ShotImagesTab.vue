<template>
  <div class="shot-images-tab">
    <div v-if="loading" class="py-6">
      <ElSkeleton :rows="4" animated />
    </div>
    <div v-else-if="!images.length" class="py-10">
      <ElEmpty description="暂无配图，点击下方按钮添加" />
    </div>
    <div v-else>
      <ElDivider content-position="left">
        <span class="text-sm">主图</span>
      </ElDivider>
      <div v-if="mainImage" class="main-image">
        <ElImage :src="mainImage.url" fit="cover" :preview-src-list="[mainImage.url]" :hide-on-click-modal="true" />
        <div class="image-actions">
          <ElButton link type="danger" size="small" @click="handleDelete(mainImage)">
            <ArtSvgIcon icon="ri:delete-bin-line" />删除主图
          </ElButton>
        </div>
      </div>
      <ElEmpty v-else description="未设置主图" :image-size="80" />

      <ElDivider content-position="left">
        <span class="text-sm">参考图 ({{ referenceImages.length }})</span>
      </ElDivider>
      <div v-if="referenceImages.length" class="ref-grid">
        <div v-for="img in referenceImages" :key="img.id" class="ref-item">
          <ElImage :src="img.url" fit="cover" :preview-src-list="referenceImages.map((i) => i.url)" :hide-on-click-modal="true" :initial-index="referenceImages.indexOf(img)" />
          <div class="ref-actions">
            <ElButton link type="danger" size="small" @click="handleDelete(img)">
              <ArtSvgIcon icon="ri:delete-bin-line" />
            </ElButton>
          </div>
        </div>
      </div>
      <ElEmpty v-else description="暂无参考图" :image-size="60" />
    </div>

    <ElDivider />
    <ElSpace>
      <ElButton type="primary" :loading="adding" @click="handleAddMain">
        <ArtSvgIcon icon="ri:add-line" class="mr-1" />添加主图
      </ElButton>
      <ElButton :loading="adding" @click="handleAddReference">
        <ArtSvgIcon icon="ri:image-add-line" class="mr-1" />添加参考图
      </ElButton>
    </ElSpace>

    <ElDialog v-model="dialogVisible" title="添加分镜配图" width="520px" align-center>
      <ElForm label-width="80px">
        <ElFormItem label="图片URL" required>
          <ElInput v-model="newImageUrl" placeholder="https://..." />
        </ElFormItem>
        <ElFormItem label="类型">
          <ElRadioGroup v-model="newImageType">
            <ElRadio value="main">主图</ElRadio>
            <ElRadio value="reference">参考图</ElRadio>
            <ElRadio value="thumbnail">缩略图</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="adding" @click="confirmAdd">确认</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    useStoryboardImages,
    useAddStoryboardImage,
    useDeleteStoryboardImage
  } from '@/api/queries/storyboard'

  interface ShotImage {
    id: string
    url: string
    imageType?: 'main' | 'reference' | 'thumbnail'
  }

  const props = defineProps<{ storyboardId: string }>()

  const { data: imagesData, isLoading: loading } = useStoryboardImages(() => props.storyboardId)
  const images = computed<ShotImage[]>(() => (imagesData.value as any) || [])
  const { mutateAsync: addImage, isPending: adding } = useAddStoryboardImage()
  const { mutateAsync: deleteImage } = useDeleteStoryboardImage()

  const mainImage = computed(() => images.value.find((i) => i.imageType === 'main'))
  const referenceImages = computed(() => images.value.filter((i) => i.imageType === 'reference'))

  const dialogVisible = ref(false)
  const newImageUrl = ref('')
  const newImageType = ref<'main' | 'reference' | 'thumbnail'>('reference')

  function handleAddMain() {
    newImageType.value = 'main'
    newImageUrl.value = ''
    dialogVisible.value = true
  }
  function handleAddReference() {
    newImageType.value = 'reference'
    newImageUrl.value = ''
    dialogVisible.value = true
  }

  async function confirmAdd() {
    if (!newImageUrl.value.trim()) {
      ElMessage.warning('请输入图片URL')
      return
    }
    try {
      await addImage({
        storyboardId: props.storyboardId,
        params: { imageUrl: newImageUrl.value.trim(), imageType: newImageType.value }
      })
      ElMessage.success('已添加')
      dialogVisible.value = false
    } catch (err) {
      ElMessage.error('添加失败')
    }
  }

  async function handleDelete(img: ShotImage) {
    try {
      await ElMessageBox.confirm('确定要删除该配图吗？', '确认', {
        type: 'warning'
      })
    } catch {
      return
    }
    try {
      await deleteImage({ imageId: img.id, storyboardId: props.storyboardId })
      ElMessage.success('已删除')
    } catch {
      ElMessage.error('删除失败')
    }
  }
</script>

<style lang="scss" scoped>
  .main-image {
    position: relative;
    width: 100%;
    max-width: 480px;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    .image-actions {
      position: absolute;
      right: 8px;
      bottom: 8px;
      padding: 4px 8px;
      background: rgb(255 255 255 / 90%);
      border-radius: 4px;
    }
  }
  .ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    .ref-item {
      position: relative;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background: var(--el-fill-color-lighter);
      border-radius: 6px;
      .ref-actions {
        position: absolute;
        right: 4px;
        top: 4px;
        padding: 2px 4px;
        background: rgb(255 255 255 / 85%);
        border-radius: 3px;
      }
    }
  }
</style>
