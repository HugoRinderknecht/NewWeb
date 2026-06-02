<template>
  <div v-if="width > 1000">
    <SectionTitle :title="'菜单类型'" />
    <div class="setting-box-wrap">
      <div
        class="setting-item"
        v-for="(item, index) in configOptions.menuLayoutList"
        :key="item.value"
        @click="switchMenuLayouts()"
      >
        <div
          class="box"
          :class="{ 'is-active': item.value === MenuTypeEnum.DUAL_MENU, 'mt-16': index > 2 }"
        >
          <img :src="item.img" />
        </div>
        <p class="name">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import SectionTitle from './SectionTitle.vue'
  import { useSettingsConfig } from '../composables/useSettingsConfig'
  import { useSettingsState } from '../composables/useSettingsState'
  import { MenuTypeEnum } from '@/enums/appEnum'

  const { width } = useWindowSize()
  const { configOptions } = useSettingsConfig()
  const { switchMenuLayouts } = useSettingsState()
</script>
