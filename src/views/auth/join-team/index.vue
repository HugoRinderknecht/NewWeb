<template>
  <div class="join-team-page min-h-screen flex items-center justify-center bg-g-100 dark:bg-g-900">
    <ElCard class="w-full max-w-lg mx-4">
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <ArtSvgIcon icon="ri:team-line" class="text-3xl text-primary" />
        </div>
        <h2 class="text-2xl font-bold m-0">加入团队</h2>
        <p class="text-g-500 mt-2">输入邀请码或邀请链接，加入协作团队</p>
      </div>

      <!-- 步骤1：输入邀请码 -->
      <div v-if="step === 1">
        <ElForm :model="codeForm" :rules="codeRules" ref="codeFormRef" label-position="top">
          <ElFormItem label="邀请码" prop="code">
            <ElInput
              v-model="codeForm.code"
              placeholder="请输入8位邀请码"
              maxlength="8"
              show-word-limit
              size="large"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:vip-crown-line" class="text-g-400" />
              </template>
            </ElInput>
          </ElFormItem>
          <ElFormItem>
            <ElButton
              type="primary"
              size="large"
              class="w-full"
              :loading="verifying"
              @click="handleVerifyCode"
            >
              验证邀请码
            </ElButton>
          </ElFormItem>
        </ElForm>

        <div class="text-center mt-4">
          <span class="text-g-500">已有账号？</span>
          <ElButton type="primary" link @click="$router.push('/auth/login')">去登录</ElButton>
        </div>
      </div>

      <!-- 步骤2：填写个人信息 -->
      <div v-if="step === 2">
        <div class="team-info mb-6 p-4 bg-primary/5 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArtSvgIcon icon="ri:building-2-line" class="text-xl text-primary" />
            </div>
            <div>
              <div class="font-medium">{{ teamInfo.name }}</div>
              <div class="text-sm text-g-500">邀请人：{{ teamInfo.inviter }}</div>
            </div>
          </div>
        </div>

        <ElForm :model="infoForm" :rules="infoRules" ref="infoFormRef" label-position="top">
          <ElFormItem label="真实姓名" prop="realName">
            <ElInput v-model="infoForm.realName" placeholder="请输入真实姓名" size="large" />
          </ElFormItem>
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model="infoForm.email" placeholder="请输入邮箱" size="large" />
          </ElFormItem>
          <ElFormItem label="手机号" prop="phone">
            <ElInput v-model="infoForm.phone" placeholder="请输入手机号" size="large" />
          </ElFormItem>
          <ElFormItem label="职位" prop="position">
            <ElSelect
              v-model="infoForm.position"
              placeholder="请选择职位"
              class="w-full"
              size="large"
            >
              <ElOption label="项目经理" value="项目经理" />
              <ElOption label="导演" value="导演" />
              <ElOption label="美术" value="美术" />
              <ElOption label="动画师" value="动画师" />
              <ElOption label="剪辑师" value="剪辑师" />
              <ElOption label="编剧" value="编剧" />
              <ElOption label="其他" value="其他" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElCheckbox v-model="infoForm.agreed">
              我已阅读并同意
              <ElButton type="primary" link @click="showAgreement = true"
                >《团队加入协议》</ElButton
              >
            </ElCheckbox>
          </ElFormItem>
          <ElFormItem>
            <ElButton
              type="primary"
              size="large"
              class="w-full"
              :disabled="!infoForm.agreed"
              :loading="submitting"
              @click="handleJoinSubmit"
            >
              确认加入团队
            </ElButton>
          </ElFormItem>
        </ElForm>

        <div class="text-center mt-4">
          <ElButton type="info" link @click="step = 1">返回上一步</ElButton>
        </div>
      </div>

      <!-- 步骤3：加入成功 -->
      <div v-if="step === 3" class="text-center py-8">
        <div
          class="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <ArtSvgIcon icon="ri:check-line" class="text-4xl text-success" />
        </div>
        <h3 class="text-xl font-bold m-0">加入成功</h3>
        <p class="text-g-500 mt-2">您已成功加入「{{ teamInfo.name }}」</p>
        <p class="text-g-400 text-sm mt-1">即将跳转到团队工作台...</p>
      </div>
    </ElCard>

    <!-- 协议弹窗 -->
    <ElDialog v-model="showAgreement" title="团队加入协议" width="600px">
      <div class="max-h-80 overflow-y-auto text-sm leading-relaxed">
        <p>1. 加入团队后，您将能够访问团队内的项目、资产和相关资源。</p>
        <p>2. 您应当遵守团队的保密协议，不得将团队内容泄露给第三方。</p>
        <p>3. 您的操作将被记录，用于团队安全审计。</p>
        <p>4. 团队管理员有权根据需要对您的权限进行调整。</p>
        <p>5. 如您主动退出团队或被移除，您将失去对团队资源的访问权限。</p>
      </div>
      <template #footer>
        <ElButton @click="showAgreement = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchJoinByCode, fetchApplyJoinTeam } from '@/api/team'

  defineOptions({ name: 'JoinTeam' })

  const router = useRouter()
  const step = ref(1)
  const showAgreement = ref(false)
  const verifying = ref(false)
  const submitting = ref(false)
  const verifiedTeamId = ref('')

  const codeFormRef = ref<FormInstance>()
  const infoFormRef = ref<FormInstance>()

  const codeForm = reactive({
    code: ''
  })

  const codeRules: FormRules = {
    code: [
      { required: true, message: '请输入邀请码', trigger: 'blur' },
      { min: 8, max: 8, message: '邀请码为8位字符', trigger: 'blur' }
    ]
  }

  const teamInfo = reactive({
    name: '星梦云算创作团队',
    inviter: '张小明'
  })

  const infoForm = reactive({
    realName: '',
    email: '',
    phone: '',
    position: '',
    agreed: false
  })

  const infoRules: FormRules = {
    realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    position: [{ required: true, message: '请选择职位', trigger: 'change' }]
  }

  const handleVerifyCode = async () => {
    if (!codeFormRef.value) return
    try {
      const valid = await codeFormRef.value.validate()
      if (!valid) return

      verifying.value = true
      await fetchJoinByCode(codeForm.code)
      ElMessage.success('邀请码验证通过')
      step.value = 2
    } catch {
      ElMessage.error('邀请码验证失败，请检查后重试')
    } finally {
      verifying.value = false
    }
  }

  const handleJoinSubmit = async () => {
    if (!infoFormRef.value) return
    try {
      const valid = await infoFormRef.value.validate()
      if (!valid) return

      submitting.value = true
      await fetchApplyJoinTeam({
        teamId: verifiedTeamId.value || '1',
        reason: `申请加入，职位：${infoForm.position}`
      })
      step.value = 3
      ElMessage.success('加入团队成功')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch {
      ElMessage.error('加入团队失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .join-team-page {
    .team-info {
      border: 1px solid var(--el-color-primary-light-7);
    }
  }
</style>
