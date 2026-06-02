<template>
  <div class="team-quota-page art-full-height">
    <ElRow :gutter="20" class="mb-5">
      <ElCol v-for="(item, index) in quotaCards" :key="index" :sm="12" :md="6" :lg="6">
        <div class="art-card relative flex flex-col justify-center h-35 px-5">
          <span class="text-g-700 text-sm">{{ item.label }}</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-[26px] font-medium">{{ item.used }}</span>
            <span class="text-g-500 text-sm">/ {{ item.total }} {{ item.unit }}</span>
          </div>
          <div class="mt-2">
            <ElProgress
              :percentage="item.percentage"
              :color="getProgressColor(item.percentage)"
              :stroke-width="6"
              :show-text="false"
            />
          </div>
          <div
            class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
          >
            <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">资源配额配置</span>
            <ElTag type="info" size="small">按团队/成员/项目设置限额</ElTag>
          </div>
          <ElButton type="primary" @click="showQuotaDialog = true">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增配额规则
          </ElButton>
        </div>
      </template>

      <!-- 配额列表 -->
      <ArtTable
        :data="filteredQuotas"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" label="序号" width="70" align="center" />
          <ElTableColumn label="配额对象" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <ArtSvgIcon
                  :icon="targetIconMap[row.targetType as TargetType]"
                  class="text-g-400"
                />
                <div>
                  <div class="font-medium">{{ row.targetName }}</div>
                  <div class="text-xs text-g-400">{{
                    targetLabelMap[row.targetType as TargetType]
                  }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="资源类型" width="140">
            <template #default="{ row }">
              <ElTag :type="resourceTagMap[row.resourceType as ResourceType]" size="small">
                {{ resourceLabelMap[row.resourceType as ResourceType] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="配额上限" width="160" align="right">
            <template #default="{ row }">
              <span class="font-medium">{{ row.limit }} {{ row.unit }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="已使用" width="160" align="right">
            <template #default="{ row }">
              <span>{{ row.used }} {{ row.unit }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="使用率" width="160">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <ElProgress
                  :percentage="Math.round((row.used / row.limit) * 100)"
                  :color="getProgressColor(Math.round((row.used / row.limit) * 100))"
                  :stroke-width="6"
                  style="width: 80px"
                />
                <span class="text-xs text-g-500"
                  >{{ Math.round((row.used / row.limit) * 100) }}%</span
                >
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="预警阈值" width="120" align="center">
            <template #default="{ row }">
              <span class="text-g-600">{{ row.alertThreshold }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElSwitch
                v-model="row.enabled"
                @change="
                  (val: string | number | boolean) => handleToggleStatus(row, val as boolean)
                "
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleEdit(row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleDelete(row)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 配额规则弹窗 -->
    <ElDialog
      v-model="showQuotaDialog"
      :title="isEdit ? '编辑配额规则' : '新增配额规则'"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm :model="quotaForm" label-width="120px" :rules="quotaRules" ref="quotaFormRef">
        <ElFormItem label="配额对象类型" prop="targetType">
          <ElRadioGroup v-model="quotaForm.targetType">
            <ElRadioButton label="team">整个团队</ElRadioButton>
            <ElRadioButton label="member">指定成员</ElRadioButton>
            <ElRadioButton label="project">指定项目</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem
          v-if="quotaForm.targetType !== 'team'"
          :label="targetSelectLabel"
          prop="targetId"
        >
          <ElSelect
            v-model="quotaForm.targetId"
            :placeholder="`请选择${targetSelectLabel}`"
            class="w-full"
          >
            <ElOption
              v-for="item in targetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="资源类型" prop="resourceType">
          <ElSelect v-model="quotaForm.resourceType" placeholder="请选择资源类型" class="w-full">
            <ElOption label="AI调用次数" value="ai_calls" />
            <ElOption label="Token消耗量" value="tokens" />
            <ElOption label="存储空间" value="storage" />
            <ElOption label="渲染时长" value="render_time" />
            <ElOption label="视频生成次数" value="video_gen" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="配额上限" prop="limit">
          <ElInputNumber v-model="quotaForm.limit" :min="1" :max="999999999" class="w-full" />
        </ElFormItem>
        <ElFormItem label="单位" prop="unit">
          <ElSelect v-model="quotaForm.unit" placeholder="请选择单位" class="w-full">
            <ElOption label="次" value="次" />
            <ElOption label="千次" value="千次" />
            <ElOption label="个" value="个" />
            <ElOption label="MB" value="MB" />
            <ElOption label="GB" value="GB" />
            <ElOption label="TB" value="TB" />
            <ElOption label="分钟" value="分钟" />
            <ElOption label="小时" value="小时" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="预警阈值">
          <ElSlider v-model="quotaForm.alertThreshold" :min="50" :max="95" :step="5" show-stops />
          <div class="text-xs text-g-500"
            >当使用率达到 {{ quotaForm.alertThreshold }}% 时发送预警通知</div
          >
        </ElFormItem>
        <ElFormItem label="周期重置">
          <ElRadioGroup v-model="quotaForm.resetCycle">
            <ElRadio label="none">不重置</ElRadio>
            <ElRadio label="daily">每日</ElRadio>
            <ElRadio label="weekly">每周</ElRadio>
            <ElRadio label="monthly">每月</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showQuotaDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleQuotaSubmit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { fetchGetTeamDetail } from '@/api/team'

  defineOptions({ name: 'TeamQuota' })

  const route = useRoute()
  const teamId = computed(() => String(route.query.id || route.query.teamId || ''))

  type TargetType = 'team' | 'member' | 'project'
  type ResourceType = 'ai_calls' | 'tokens' | 'storage' | 'render_time' | 'video_gen'
  type ResetCycle = 'none' | 'daily' | 'weekly' | 'monthly'

  interface QuotaItem {
    id: number
    targetType: TargetType
    targetName: string
    resourceType: ResourceType
    limit: number
    used: number
    unit: string
    alertThreshold: number
    resetCycle: ResetCycle
    enabled: boolean
  }

  const showQuotaDialog = ref(false)
  const isEdit = ref(false)
  const quotaFormRef = ref<FormInstance>()

  const targetIconMap: Record<TargetType, string> = {
    team: 'ri:team-line',
    member: 'ri:user-line',
    project: 'ri:folder-3-line'
  }

  const targetLabelMap: Record<TargetType, string> = {
    team: '整个团队',
    member: '指定成员',
    project: '指定项目'
  }

  const resourceTagMap: Record<
    ResourceType,
    'primary' | 'success' | 'warning' | 'info' | 'danger'
  > = {
    ai_calls: 'primary',
    tokens: 'success',
    storage: 'warning',
    render_time: 'info',
    video_gen: 'danger'
  }

  const resourceLabelMap: Record<ResourceType, string> = {
    ai_calls: 'AI调用次数',
    tokens: 'Token消耗量',
    storage: '存储空间',
    render_time: '渲染时长',
    video_gen: '视频生成次数'
  }

  const quotaList = ref<QuotaItem[]>([])
  const loading = ref(false)

  const defaultQuotaList: QuotaItem[] = [
    {
      id: 1,
      targetType: 'team',
      targetName: '星梦云算创作团队',
      resourceType: 'ai_calls',
      limit: 50000,
      used: 32500,
      unit: '次',
      alertThreshold: 80,
      resetCycle: 'monthly',
      enabled: true
    },
    {
      id: 2,
      targetType: 'team',
      targetName: '星梦云算创作团队',
      resourceType: 'storage',
      limit: 500,
      used: 320,
      unit: 'GB',
      alertThreshold: 85,
      resetCycle: 'none',
      enabled: true
    },
    {
      id: 3,
      targetType: 'member',
      targetName: '陈小东',
      resourceType: 'ai_calls',
      limit: 2000,
      used: 850,
      unit: '次',
      alertThreshold: 75,
      resetCycle: 'monthly',
      enabled: true
    },
    {
      id: 4,
      targetType: 'member',
      targetName: '林小静',
      resourceType: 'video_gen',
      limit: 100,
      used: 45,
      unit: '次',
      alertThreshold: 80,
      resetCycle: 'weekly',
      enabled: true
    },
    {
      id: 5,
      targetType: 'project',
      targetName: '品牌宣传片-春季',
      resourceType: 'render_time',
      limit: 50,
      used: 38,
      unit: '小时',
      alertThreshold: 90,
      resetCycle: 'none',
      enabled: true
    },
    {
      id: 6,
      targetType: 'project',
      targetName: '企业年会回顾',
      resourceType: 'tokens',
      limit: 500,
      used: 420,
      unit: '千次',
      alertThreshold: 85,
      resetCycle: 'monthly',
      enabled: false
    }
  ]

  const loadQuotaData = async () => {
    loading.value = true
    try {
      if (teamId.value) {
        const detail = await fetchGetTeamDetail(teamId.value)
        if (detail) {
          const teamName = (detail as any).teamName || (detail as any).name || ''
          const quotas = (detail as any).quotas
          if (Array.isArray(quotas) && quotas.length > 0) {
            quotaList.value = quotas.map((q: any, index: number) => ({
              id: q.id || index + 1,
              targetType: q.targetType || 'team',
              targetName: q.targetName || teamName,
              resourceType: q.resourceType || 'ai_calls',
              limit: q.limit || 0,
              used: q.used || 0,
              unit: q.unit || '次',
              alertThreshold: q.alertThreshold || 80,
              resetCycle: q.resetCycle || 'monthly',
              enabled: q.enabled !== undefined ? q.enabled : true
            }))
          } else {
            quotaList.value = defaultQuotaList.map((item) => ({
              ...item,
              targetName: item.targetType === 'team' ? teamName : item.targetName
            }))
          }
        } else {
          quotaList.value = [...defaultQuotaList]
        }
      } else {
        quotaList.value = [...defaultQuotaList]
      }
    } catch {
      quotaList.value = [...defaultQuotaList]
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadQuotaData()
  })

  const quotaCards = computed(() => {
    const ai = quotaList.value.find((q) => q.targetType === 'team' && q.resourceType === 'ai_calls')
    const storage = quotaList.value.find(
      (q) => q.targetType === 'team' && q.resourceType === 'storage'
    )
    const render = quotaList.value.find(
      (q) => q.targetType === 'team' && q.resourceType === 'render_time'
    )
    const video = quotaList.value.find(
      (q) => q.targetType === 'team' && q.resourceType === 'video_gen'
    )

    return [
      {
        label: 'AI调用次数（本月）',
        used: ai?.used ?? 0,
        total: ai?.limit ?? 0,
        unit: ai?.unit ?? '次',
        percentage: ai ? Math.round((ai.used / ai.limit) * 100) : 0,
        icon: 'ri:robot-2-line'
      },
      {
        label: '存储空间',
        used: storage?.used ?? 0,
        total: storage?.limit ?? 0,
        unit: storage?.unit ?? 'GB',
        percentage: storage ? Math.round((storage.used / storage.limit) * 100) : 0,
        icon: 'ri:database-2-line'
      },
      {
        label: '渲染时长',
        used: render?.used ?? 0,
        total: render?.limit ?? 0,
        unit: render?.unit ?? '小时',
        percentage: render ? Math.round((render.used / render.limit) * 100) : 0,
        icon: 'ri:movie-line'
      },
      {
        label: '视频生成次数',
        used: video?.used ?? 0,
        total: video?.limit ?? 0,
        unit: video?.unit ?? '次',
        percentage: video ? Math.round((video.used / video.limit) * 100) : 0,
        icon: 'ri:video-line'
      }
    ]
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'targetName', label: '配额对象', minWidth: 200 },
    { prop: 'resourceType', label: '资源类型', width: 140 },
    { prop: 'limit', label: '配额上限', width: 160 },
    { prop: 'used', label: '已使用', width: 160 },
    { prop: 'percentage', label: '使用率', width: 160 },
    { prop: 'alertThreshold', label: '预警阈值', width: 120 },
    { prop: 'enabled', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 150, fixed: 'right' }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredQuotas = computed(() => {
    const total = quotaList.value.length
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    nextTick(() => {
      pagination.total = total
    })
    return quotaList.value.slice(start, end)
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#F56C6C'
    if (percentage >= 75) return '#E6A23C'
    return '#67C23A'
  }

  const quotaForm = reactive({
    id: 0,
    targetType: 'team' as TargetType,
    targetId: '',
    resourceType: '' as ResourceType,
    limit: 1000,
    unit: '次',
    alertThreshold: 80,
    resetCycle: 'monthly' as ResetCycle
  })

  const quotaRules: FormRules = {
    targetType: [{ required: true, message: '请选择配额对象类型', trigger: 'change' }],
    targetId: [
      {
        required: true,
        message: '请选择配额对象',
        trigger: 'change',
        validator: (_rule, _value, callback) => {
          if (quotaForm.targetType !== 'team' && !quotaForm.targetId) {
            callback(new Error('请选择配额对象'))
          } else {
            callback()
          }
        }
      }
    ],
    resourceType: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
    limit: [{ required: true, message: '请输入配额上限', trigger: 'blur' }],
    unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
  }

  const targetSelectLabel = computed(() => {
    return quotaForm.targetType === 'member' ? '选择成员' : '选择项目'
  })

  const targetOptions = computed(() => {
    if (quotaForm.targetType === 'member') {
      return [
        { label: '张小明', value: 'zhangxm' },
        { label: '李小红', value: 'lixh' },
        { label: '王小刚', value: 'wangxg' },
        { label: '赵小美', value: 'zhaoxm' },
        { label: '陈小东', value: 'chenxd' },
        { label: '林小静', value: 'linxj' }
      ]
    }
    if (quotaForm.targetType === 'project') {
      return [
        { label: '品牌宣传片-春季', value: 'project-1' },
        { label: '产品发布视频', value: 'project-2' },
        { label: '企业年会回顾', value: 'project-3' },
        { label: '培训课程系列', value: 'project-4' },
        { label: '社交媒体短视频', value: 'project-5' }
      ]
    }
    return []
  })

  const handleEdit = (row: QuotaItem) => {
    isEdit.value = true
    quotaForm.id = row.id
    quotaForm.targetType = row.targetType
    quotaForm.targetId = row.targetType === 'team' ? '' : String(row.id)
    quotaForm.resourceType = row.resourceType
    quotaForm.limit = row.limit
    quotaForm.unit = row.unit
    quotaForm.alertThreshold = row.alertThreshold
    quotaForm.resetCycle = row.resetCycle
    showQuotaDialog.value = true
  }

  const handleDelete = (row: QuotaItem) => {
    ElMessageBox.confirm(
      `确定要删除「${row.targetName}」的${resourceLabelMap[row.resourceType]}配额规则吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    ).then(() => {
      quotaList.value = quotaList.value.filter((q) => q.id !== row.id)
      ElMessage.success('配额规则已删除')
    })
  }

  const handleToggleStatus = (row: QuotaItem, val: boolean) => {
    const action = val ? '启用' : '禁用'
    ElMessage.success(`已${action}「${row.targetName}」的配额规则`)
  }

  const handleQuotaSubmit = async () => {
    if (!quotaFormRef.value) return
    await quotaFormRef.value.validate((valid) => {
      if (valid) {
        if (isEdit.value) {
          const index = quotaList.value.findIndex((q) => q.id === quotaForm.id)
          if (index !== -1) {
            quotaList.value[index] = {
              ...quotaList.value[index],
              resourceType: quotaForm.resourceType,
              limit: quotaForm.limit,
              unit: quotaForm.unit,
              alertThreshold: quotaForm.alertThreshold,
              resetCycle: quotaForm.resetCycle
            }
          }
          ElMessage.success('配额规则已更新')
        } else {
          const newItem: QuotaItem = {
            id: Date.now(),
            targetType: quotaForm.targetType,
            targetName:
              quotaForm.targetType === 'team'
                ? '星梦云算创作团队'
                : targetOptions.value.find((o) => o.value === quotaForm.targetId)?.label || '',
            resourceType: quotaForm.resourceType,
            limit: quotaForm.limit,
            used: 0,
            unit: quotaForm.unit,
            alertThreshold: quotaForm.alertThreshold,
            resetCycle: quotaForm.resetCycle,
            enabled: true
          }
          quotaList.value.push(newItem)
          ElMessage.success('配额规则已创建')
        }
        showQuotaDialog.value = false
        resetQuotaForm()
      }
    })
  }

  const resetQuotaForm = () => {
    quotaForm.id = 0
    quotaForm.targetType = 'team'
    quotaForm.targetId = ''
    quotaForm.resourceType = '' as ResourceType
    quotaForm.limit = 1000
    quotaForm.unit = '次'
    quotaForm.alertThreshold = 80
    quotaForm.resetCycle = 'monthly'
    isEdit.value = false
  }

  watch(showQuotaDialog, (val) => {
    if (!val) resetQuotaForm()
  })
</script>

<style lang="scss" scoped>
  .team-quota-page {
    height: 100%;
  }
</style>
