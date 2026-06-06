<template>
  <div class="shot-filters">
    <ElSpace :size="8" wrap>
      <ElInput
        :model-value="filters.keyword"
        placeholder="搜索分镜标题/描述"
        clearable
        style="width: 220px"
        @update:model-value="(v) => update('keyword', v)"
        @keyup.enter="emitChange"
      >
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
        </template>
      </ElInput>

      <ElSelect
        :model-value="filters.status"
        placeholder="状态"
        clearable
        style="width: 120px"
        @update:model-value="(v) => update('status', v)"
        @change="emitChange"
      >
        <ElOption label="草稿" :value="1" />
        <ElOption label="待审核" :value="2" />
        <ElOption label="已通过" :value="3" />
        <ElOption label="已驳回" :value="4" />
      </ElSelect>

      <ElSelect
        :model-value="filters.shotType"
        placeholder="镜头类型"
        clearable
        style="width: 120px"
        @update:model-value="(v) => update('shotType', v)"
        @change="emitChange"
      >
        <ElOption label="叙述 narrative" value="narrative" />
        <ElOption label="呼吸 breath" value="breath" />
        <ElOption label="高潮 climax" value="climax" />
        <ElOption label="转场 transition" value="transition" />
      </ElSelect>

      <ElSelect
        :model-value="filters.cameraAngle"
        placeholder="景别"
        clearable
        style="width: 120px"
        @update:model-value="(v) => update('cameraAngle', v)"
        @change="emitChange"
      >
        <ElOption label="广角 wide" value="wide" />
        <ElOption label="中景 medium" value="medium" />
        <ElOption label="近景 close" value="close" />
        <ElOption label="特写 extreme_close" value="extreme_close" />
        <ElOption label="过肩 over_shoulder" value="over_shoulder" />
        <ElOption label="主观 pov" value="pov" />
        <ElOption label="俯视 birds_eye" value="birds_eye" />
        <ElOption label="荷兰角 dutch" value="dutch" />
      </ElSelect>

      <ElSelect
        :model-value="filters.cameraMovement"
        placeholder="运镜"
        clearable
        style="width: 120px"
        @update:model-value="(v) => update('cameraMovement', v)"
        @change="emitChange"
      >
        <ElOption label="固定 fixed" value="fixed" />
        <ElOption label="摇 pan" value="pan" />
        <ElOption label="俯仰 tilt" value="tilt" />
        <ElOption label="推拉 dolly" value="dolly" />
        <ElOption label="升降 crane" value="crane" />
        <ElOption label="跟踪 tracking" value="tracking" />
        <ElOption label="斯坦尼康 steadicam" value="steadicam" />
        <ElOption label="变焦 zoom" value="zoom" />
      </ElSelect>

      <ElButton v-if="hasActive" link type="primary" @click="$emit('reset')">
        <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />重置
      </ElButton>
    </ElSpace>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Filters {
    keyword: string
    status: number | ''
    episodeId: string
    sceneId: string
    shotType: string
    cameraAngle: string
    cameraMovement: string
  }
  const props = defineProps<{ filters: Filters }>()
  const emit = defineEmits<{
    (e: 'update:filters', value: Filters): void
    (e: 'change'): void
    (e: 'reset'): void
  }>()

  const hasActive = computed(() => {
    return Object.values(props.filters).some((v) => v !== '' && v !== undefined && v !== null)
  })

  function update<K extends keyof Filters>(key: K, val: Filters[K]) {
    emit('update:filters', { ...props.filters, [key]: val })
  }
  function emitChange() {
    emit('change')
  }
</script>
