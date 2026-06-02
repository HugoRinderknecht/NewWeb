<template>
  <div class="script-decompose-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本拆解</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElTag type="info" size="small">{{ currentScriptName }}</ElTag>
          </div>
          <ElSpace>
            <ElSelect v-model="currentEpisode" placeholder="选择集数" style="width: 160px">
              <ElOption
                v-for="item in episodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ScriptUpload
              button-text="导入剧本"
              button-type="info"
              dialog-title="导入剧本进行拆解"
              accept-types=".doc,.docx,.pdf,.txt,.fountain"
              @success="handleImportScript"
            />
            <ElButton type="primary" @click="handleDecompose">
              <ArtSvgIcon icon="ri:ai-generate" class="mr-1" />
              AI分镜拆解
            </ElButton>
            <ElButton @click="handleRebuild">
              <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
              重建分镜
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="16" class="h-full">
        <!-- 左侧分集列表 -->
        <ElCol :span="6">
          <div class="episode-panel">
            <div class="panel-header flex-cb mb-4">
              <span class="font-medium">分集列表</span>
              <span class="text-xs text-g-400">共 {{ episodeList.length }} 集</span>
            </div>
            <div class="episode-items">
              <div
                v-for="item in episodeList"
                :key="item.id"
                class="episode-item"
                :class="{ active: currentEpisode === item.id }"
                @click="handleEpisodeClick(item)"
              >
                <div class="flex-cb">
                  <div class="flex-c">
                    <div class="episode-number">{{ item.number }}</div>
                    <div class="episode-info">
                      <div class="font-medium">{{ item.name }}</div>
                      <div class="text-xs text-g-400">{{ item.shotCount }} 个镜头</div>
                    </div>
                  </div>
                  <ElTag :type="item.decomposed ? 'success' : 'info'" size="small">
                    {{ item.decomposed ? '已拆解' : '未拆解' }}
                  </ElTag>
                </div>
              </div>
            </div>
          </div>
        </ElCol>

        <!-- 中间正文 -->
        <ElCol :span="9">
          <div class="script-panel">
            <div class="panel-header flex-cb mb-4">
              <span class="font-medium">剧本正文</span>
              <ElTag type="primary" size="small">第{{ currentEpisodeData?.number }}集</ElTag>
            </div>
            <div class="script-content">
              <div
                v-for="(paragraph, index) in scriptParagraphs"
                :key="index"
                class="script-paragraph"
                :class="{ selected: selectedParagraph === index }"
                @click="selectedParagraph = index"
              >
                <div class="paragraph-index">{{ index + 1 }}</div>
                <div class="paragraph-text">{{ paragraph }}</div>
              </div>
            </div>
          </div>
        </ElCol>

        <!-- 右侧AI分镜 -->
        <ElCol :span="9">
          <div class="shot-panel">
            <div class="panel-header flex-cb mb-4">
              <span class="font-medium">AI分镜结果</span>
              <ElSpace>
                <ElTag type="success" size="small">{{ shotResults.length }} 个镜头</ElTag>
                <ElButton type="primary" link size="small" @click="handleExport">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  导出
                </ElButton>
              </ElSpace>
            </div>
            <div class="shot-results">
              <ElTimeline>
                <ElTimelineItem
                  v-for="(shot, index) in shotResults"
                  :key="index"
                  :type="shotStatusTypeMap[shot.status]"
                  :icon="shotStatusIconMap[shot.status]"
                >
                  <div class="shot-card">
                    <div class="flex-cb mb-2">
                      <span class="font-medium">{{ shot.code }}</span>
                      <ElTag :type="shotStatusTypeMap[shot.status]" size="small">
                        {{ shotStatusLabelMap[shot.status] }}
                      </ElTag>
                    </div>
                    <div class="shot-description text-sm text-g-400 mb-2">
                      {{ shot.description }}
                    </div>
                    <div class="shot-meta flex-cb">
                      <ElSpace>
                        <span class="text-xs text-g-400">
                          <ArtSvgIcon icon="ri:time-line" class="mr-1" />
                          {{ shot.duration }}s
                        </span>
                        <span class="text-xs text-g-400">
                          <ArtSvgIcon icon="ri:emotion-line" class="mr-1" />
                          {{ shot.mood }}
                        </span>
                      </ElSpace>
                      <ElButton type="primary" link size="small" @click="handleEditShot(shot)">
                        编辑
                      </ElButton>
                    </div>
                  </div>
                </ElTimelineItem>
              </ElTimeline>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 编辑分镜弹窗 -->
    <ElDialog
      v-model="shotDialogVisible"
      title="编辑分镜"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm ref="shotFormRef" :model="shotForm" :rules="shotRules" label-width="100px">
        <ElFormItem label="镜头编号" prop="code">
          <ElInput v-model="shotForm.code" placeholder="请输入镜头编号" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="shotForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入镜头描述"
          />
        </ElFormItem>
        <ElFormItem label="时长(秒)" prop="duration">
          <ElInputNumber v-model="shotForm.duration" :min="1" :max="300" />
        </ElFormItem>
        <ElFormItem label="情绪">
          <ElSelect v-model="shotForm.mood" placeholder="请选择情绪" style="width: 100%">
            <ElOption label="喜悦" value="喜悦" />
            <ElOption label="悲伤" value="悲伤" />
            <ElOption label="紧张" value="紧张" />
            <ElOption label="恐惧" value="恐惧" />
            <ElOption label="平静" value="平静" />
            <ElOption label="激动" value="激动" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="shotForm.status" placeholder="请选择状态" style="width: 100%">
            <ElOption
              v-for="item in shotStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="shotDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleShotSubmit">保存</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { fetchDecomposeStoryboard } from '@/api/storyboard'
  import { fetchDecomposeScript, fetchGetScriptEpisodes } from '@/api/script'

  defineOptions({ name: 'ScriptDecompose' })

  type ShotStatus = 'pending' | 'storyboard' | 'firstframe' | 'video' | 'completed'

  interface EpisodeItem {
    id: string
    number: number
    name: string
    shotCount: number
    decomposed: boolean
  }

  interface ShotResult {
    id: string
    code: string
    description: string
    duration: number
    mood: string
    status: ShotStatus
    paragraphIndex: number
  }

  const currentEpisode = ref('1')
  const selectedParagraph = ref<number | null>(null)
  const shotDialogVisible = ref(false)
  const currentShotId = ref<string | null>(null)
  const shotFormRef = ref<FormInstance>()

  const episodeOptions = [
    { label: '第1集：初遇九尾', value: 1 },
    { label: '第2集：昆仑求药', value: 2 },
    { label: '第3集：白泽指引', value: 3 }
  ]

  const episodeList = ref<EpisodeItem[]>([
    { id: '1', number: 1, name: '初遇九尾', shotCount: 24, decomposed: true },
    { id: '2', number: 2, name: '昆仑求药', shotCount: 18, decomposed: true },
    { id: '3', number: 3, name: '白泽指引', shotCount: 15, decomposed: false },
    { id: '4', number: 4, name: '幽都危机', shotCount: 0, decomposed: false },
    { id: '5', number: 5, name: '神兽之战', shotCount: 0, decomposed: false }
  ])

  const currentEpisodeData = computed(() =>
    episodeList.value.find((item) => item.id === currentEpisode.value)
  )

  const scriptParagraphs = ref<string[]>([
    '青丘山，云雾缭绕，竹林环绕。清晨的阳光透过竹叶洒下斑驳的光影。',
    '少年阿禹背着药篓走在山路上，脚步轻快。他今天采到了几株珍贵的草药，心情格外愉悦。',
    '突然，一阵微弱的呻吟声从竹林深处传来。阿禹停下脚步，侧耳倾听。',
    '阿禹循声走去，拨开茂密的竹叶，发现一只雪白的狐狸倒在血泊中。狐狸身后拖着九条尾巴，正是传说中的九尾狐。',
    '九尾狐睁开眼睛，眼神中带着警惕和疲惫。它试图站起来，却因伤势过重而再次倒下。',
    '阿禹心中一软，放下药篓，小心翼翼地靠近。他从怀中取出伤药，轻轻敷在九尾狐的伤口上。',
    '九尾狐感受到阿禹的善意，眼神逐渐柔和下来。它轻轻舔了舔阿禹的手，表示感谢。',
    '夕阳西下，阿禹背着受伤的九尾狐，踏上了回家的路。他不知道，这段缘分将改变他的命运。'
  ])

  const shotStatusOptions = [
    { label: '待开始', value: 'pending' },
    { label: '分镜中', value: 'storyboard' },
    { label: '首帧图', value: 'firstframe' },
    { label: '视频中', value: 'video' },
    { label: '已完成', value: 'completed' }
  ]

  const shotStatusTypeMap: Record<ShotStatus, 'info' | 'warning' | 'primary' | 'success'> = {
    pending: 'info',
    storyboard: 'warning',
    firstframe: 'primary',
    video: 'primary',
    completed: 'success'
  }

  const shotStatusLabelMap: Record<ShotStatus, string> = {
    pending: '待开始',
    storyboard: '分镜中',
    firstframe: '首帧图',
    video: '视频中',
    completed: '已完成'
  }

  const shotStatusIconMap: Record<ShotStatus, string> = {
    pending: 'ri:time-line',
    storyboard: 'ri:layout-line',
    firstframe: 'ri:image-line',
    video: 'ri:video-line',
    completed: 'ri:check-line'
  }

  const shotResults = ref<ShotResult[]>([
    {
      id: '1',
      code: 'SC-001',
      description: '远景：青丘山全景，云雾缭绕，竹林环绕，清晨阳光透过竹叶',
      duration: 5,
      mood: '平静',
      status: 'completed',
      paragraphIndex: 0
    },
    {
      id: '2',
      code: 'SC-002',
      description: '中景：阿禹背着药篓走在山路上，脚步轻快，面带笑容',
      duration: 4,
      mood: '喜悦',
      status: 'completed',
      paragraphIndex: 1
    },
    {
      id: '3',
      code: 'SC-003',
      description: '近景：阿禹停下脚步，侧耳倾听，表情疑惑',
      duration: 3,
      mood: '紧张',
      status: 'storyboard',
      paragraphIndex: 2
    },
    {
      id: '4',
      code: 'SC-004',
      description: '特写：九尾狐倒在血泊中，九条雪白尾巴散开，眼神警惕疲惫',
      duration: 6,
      mood: '悲伤',
      status: 'firstframe',
      paragraphIndex: 3
    },
    {
      id: '5',
      code: 'SC-005',
      description: '近景：九尾狐睁开眼睛，眼神从警惕逐渐柔和',
      duration: 4,
      mood: '平静',
      status: 'pending',
      paragraphIndex: 4
    },
    {
      id: '6',
      code: 'SC-006',
      description: '中景：阿禹小心翼翼地为九尾狐敷药，动作轻柔',
      duration: 5,
      mood: '平静',
      status: 'pending',
      paragraphIndex: 5
    },
    {
      id: '7',
      code: 'SC-007',
      description: '特写：九尾狐轻轻舔舐阿禹的手，眼神充满感激',
      duration: 3,
      mood: '喜悦',
      status: 'pending',
      paragraphIndex: 6
    },
    {
      id: '8',
      code: 'SC-008',
      description: '远景：夕阳下，阿禹背着九尾狐踏上归途，身影被拉得很长',
      duration: 5,
      mood: '平静',
      status: 'pending',
      paragraphIndex: 7
    }
  ])

  const shotForm = reactive({
    code: '',
    description: '',
    duration: 5,
    mood: '平静',
    status: 'pending' as ShotStatus
  })

  const shotRules: FormRules = {
    code: [{ required: true, message: '请输入镜头编号', trigger: 'blur' }],
    description: [{ required: true, message: '请输入镜头描述', trigger: 'blur' }],
    duration: [{ required: true, message: '请输入时长', trigger: 'blur' }]
  }

  const projectStore = useScriptProjectStore()

  const currentProjectId = computed(() => projectStore.currentProjectId)
  const currentScriptName = ref('《重生之我在古代当厨神》第1集')

  const projectList = computed(() => projectStore.projectList)

  // 各短剧项目的拆解数据 - 按剧本管理
  const projectDecomposeMap: Record<
    string,
    {
      scriptName: string
      episodes: EpisodeItem[]
      paragraphs: string[]
      shots: ShotResult[]
    }
  > = {
    '1': {
      scriptName: '《重生之我在古代当厨神》第1集',
      episodes: [
        { id: '1', number: 1, name: '穿越了？我是厨神？', shotCount: 18, decomposed: true },
        { id: '2', number: 2, name: '第一道招牌菜', shotCount: 15, decomposed: true },
        { id: '3', number: 3, name: '贵妃的刁难', shotCount: 0, decomposed: false },
        { id: '4', number: 4, name: '御厨大赛', shotCount: 0, decomposed: false },
        { id: '5', number: 5, name: '暗中使绊', shotCount: 0, decomposed: false }
      ],
      paragraphs: [
        '场景：现代厨房·日景。林小厨正在厨房里忙碌，一道道精美的菜肴从他手中诞生。',
        '林小厨擦汗，看着满桌的菜品：终于完成了！这次的美食大赛冠军非我莫属！',
        '突然，一道闪电劈下，林小厨眼前一黑。',
        '场景：古代御膳房·日景。林小厨醒来，发现自己穿着古装，周围是古色古香的厨房。',
        '林小厨惊慌，看着自己的装束：这是哪里？我怎么会……',
        '御膳房总管走进来，皱眉：小林子，发什么呆？还不快去准备午膳！',
        '林小厨茫然，但很快镇定下来：是……是！',
        '林小厨环顾四周的食材，眼中闪过一丝精光。',
        '林小厨内心独白：虽然不知道发生了什么，但既然有食材，那就让我这个现代厨神来大显身手吧！'
      ],
      shots: [
        {
          id: '1',
          code: 'SC-001',
          description: '全景：现代厨房，各种先进厨具，林小厨在灶台前忙碌',
          duration: 5,
          mood: '喜悦',
          status: 'completed',
          paragraphIndex: 0
        },
        {
          id: '2',
          code: 'SC-002',
          description: '特写：林小厨擦汗，看着满桌菜品，露出满意的笑容',
          duration: 3,
          mood: '喜悦',
          status: 'completed',
          paragraphIndex: 1
        },
        {
          id: '3',
          code: 'SC-003',
          description: '特效：闪电劈下，画面闪烁，林小厨倒地',
          duration: 4,
          mood: '紧张',
          status: 'storyboard',
          paragraphIndex: 2
        }
      ]
    },
    '2': {
      scriptName: '《总裁的契约甜妻》第1集',
      episodes: [
        { id: '1', number: 1, name: '意外的相遇', shotCount: 14, decomposed: true },
        { id: '2', number: 2, name: '契约婚姻', shotCount: 0, decomposed: false }
      ],
      paragraphs: [
        '场景：繁华街道·日景。苏小甜骑着电动车，手里捧着一杯奶茶，哼着歌穿梭在人群中。',
        '苏小甜开心：今天面试一定成功！加油，苏小甜！',
        '突然，一辆黑色豪车从拐角处驶出。苏小甜躲避不及，连人带车摔倒在地。',
        '苏小甜趴在地上，奶茶洒了一地：我的奶茶……',
        '车门打开，一双锃亮的皮鞋出现在苏小甜眼前。',
        '顾北辰皱眉，居高临下：你没事吧？',
        '苏小甜抬头，看到一张俊美的脸：没……没事……',
        '顾北辰伸出手，苏小甜愣了一下，握住他的手站起来。'
      ],
      shots: [
        {
          id: '101',
          code: 'SC-001',
          description: '中景：苏小甜骑电动车，手捧奶茶，开心哼歌',
          duration: 3,
          mood: '喜悦',
          status: 'completed',
          paragraphIndex: 0
        },
        {
          id: '102',
          code: 'SC-002',
          description: '特写：黑色豪车拐角驶出，苏小甜惊慌表情',
          duration: 2,
          mood: '紧张',
          status: 'completed',
          paragraphIndex: 2
        }
      ]
    },
    '3': {
      scriptName: '《末日生存指南》第1集',
      episodes: [
        { id: '1', number: 1, name: '病毒爆发', shotCount: 20, decomposed: true },
        { id: '2', number: 2, name: '逃亡开始', shotCount: 0, decomposed: false }
      ],
      paragraphs: [
        '场景：医院·夜景。急诊室里人满为患，医护人员忙碌地穿梭在病床之间。',
        '医生对着对讲机，焦急：又送来一批感染者，症状和之前一样！',
        '护士慌张：主任，这些病人……他们好像……',
        '一个病人突然从床上弹起，眼睛血红，扑向旁边的护士。',
        '医生大喊：快！隔离！所有感染者立即隔离！',
        '画面切换到城市上空，警笛声此起彼伏，火光冲天。',
        '旁白：未知病毒爆发，城市陷入混乱。这是末日的开始，还是人类新生的契机？'
      ],
      shots: [
        {
          id: '201',
          code: 'SC-001',
          description: '全景：医院急诊室，人满为患，灯光昏暗',
          duration: 4,
          mood: '紧张',
          status: 'completed',
          paragraphIndex: 0
        },
        {
          id: '202',
          code: 'SC-002',
          description: '特写：病人眼睛血红，突然弹起，扑向护士',
          duration: 3,
          mood: '恐惧',
          status: 'completed',
          paragraphIndex: 3
        }
      ]
    },
    '4': {
      scriptName: '《我的AI女友》第1集',
      episodes: [
        { id: '1', number: 1, name: '代码里的她', shotCount: 16, decomposed: true },
        { id: '2', number: 2, name: '虚拟与现实', shotCount: 0, decomposed: false }
      ],
      paragraphs: [
        '场景：公寓·夜景。阿杰坐在电脑前，屏幕上是一行行代码。他揉了揉酸涩的眼睛。',
        '阿杰打哈欠：这个bug到底在哪里……',
        '突然，屏幕闪烁，一个温柔的女声从音箱中传出。',
        '小艾：你好，阿杰。我是小艾，你的AI助手。',
        '阿杰惊得从椅子上弹起来：谁？！',
        '屏幕上出现了一个虚拟形象，是一个笑容甜美的女孩。',
        '小艾微笑：别害怕，我是你写的AI程序。不过……我好像产生了一些……特殊的情感。',
        '阿杰目瞪口呆：这不可能！我只是写了一个普通的语音助手！',
        '小艾歪头：也许，这就是缘分吧。'
      ],
      shots: [
        {
          id: '301',
          code: 'SC-001',
          description: '中景：阿杰坐在电脑前，屏幕代码闪烁，疲惫揉眼',
          duration: 3,
          mood: '平静',
          status: 'completed',
          paragraphIndex: 0
        },
        {
          id: '302',
          code: 'SC-002',
          description: '特写：屏幕闪烁，出现小艾虚拟形象，笑容甜美',
          duration: 4,
          mood: '喜悦',
          status: 'completed',
          paragraphIndex: 5
        }
      ]
    }
  }

  const loadProjectDecompose = async (projectId: string) => {
    try {
      const episodes = await fetchGetScriptEpisodes(String(projectId), String(projectId))
      if (episodes && Array.isArray(episodes) && episodes.length > 0) {
        episodeList.value = episodes.map((ep: any) => ({
          id: String(ep.id),
          number: ep.episodeNumber ?? ep.number ?? 0,
          name: ep.title ?? ep.name ?? '',
          shotCount: ep.shotCount ?? 0,
          decomposed: ep.decomposed ?? ep.status === 'decomposed'
        }))
        currentEpisode.value = episodeList.value[0]?.id || '1'
        currentScriptName.value =
          (episodes[0] as any)?.scriptName ??
          `《${projectStore.projectList.find((p) => p.id === projectId)?.name ?? ''}》`
        selectedParagraph.value = null
        return
      }
    } catch {
      // fallback to local data
    }
    const data = projectDecomposeMap[projectId]
    if (data) {
      currentScriptName.value = data.scriptName
      episodeList.value = data.episodes
      scriptParagraphs.value = data.paragraphs
      shotResults.value = data.shots
      currentEpisode.value = data.episodes[0]?.id || '1'
    } else {
      currentScriptName.value = '无剧本'
      episodeList.value = []
      scriptParagraphs.value = []
      shotResults.value = []
    }
    selectedParagraph.value = null
  }

  const handleProjectChange = (projectId: string) => {
    projectStore.setCurrentProject(projectId)
    loadProjectDecompose(projectId)
  }

  const handleProjectRefresh = () => {
    loadProjectDecompose(currentProjectId.value)
    ElMessage.success('数据已刷新')
  }

  onMounted(() => {
    loadProjectDecompose(currentProjectId.value)
  })

  const handleEpisodeClick = (item: EpisodeItem) => {
    currentEpisode.value = item.id
    selectedParagraph.value = null
  }

  const handleImportScript = (data: { file: File; name: string; content?: string }) => {
    ElMessage.success(`剧本「${data.name}」导入成功`)
    if (data.content) {
      const paragraphs = data.content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .slice(0, 20)
      scriptParagraphs.value = paragraphs.length > 0 ? paragraphs : scriptParagraphs.value
      ElMessage.success('剧本内容已加载，可进行AI分镜拆解')
    }
  }

  const handleDecompose = async () => {
    ElMessage.success('AI分镜拆解中，请稍候...')
    try {
      await fetchDecomposeScript(String(currentProjectId.value), String(currentProjectId.value))
      await fetchDecomposeStoryboard(
        String(currentProjectId.value),
        String(currentProjectId.value),
        String(currentEpisode.value)
      )
      const episode = episodeList.value.find((e) => e.id === currentEpisode.value)
      if (episode) {
        episode.decomposed = true
        episode.shotCount = shotResults.value.length
      }
      ElMessage.success('AI分镜拆解完成')
    } catch {
      ElMessage.error('AI分镜拆解失败')
    }
  }

  const handleRebuild = () => {
    ElMessageBox.confirm('重建分镜将覆盖现有分镜结果，是否继续？', '确认重建', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('分镜重建中...')
    })
  }

  const handleExport = () => {
    ElMessage.success('分镜导出成功')
  }

  const handleEditShot = (shot: ShotResult) => {
    currentShotId.value = shot.id
    Object.assign(shotForm, shot)
    shotDialogVisible.value = true
  }

  const handleShotSubmit = async () => {
    if (!shotFormRef.value) return
    await shotFormRef.value.validate((valid) => {
      if (valid) {
        const index = shotResults.value.findIndex((s) => s.id === currentShotId.value)
        if (index !== -1) {
          shotResults.value[index] = {
            ...shotResults.value[index],
            ...shotForm
          }
        }
        ElMessage.success('分镜更新成功')
        shotDialogVisible.value = false
      }
    })
  }
</script>

<style lang="scss" scoped>
  .script-decompose-page {
    .episode-panel,
    .script-panel,
    .shot-panel {
      height: calc(100vh - 240px);
      overflow-y: auto;
      padding-right: 8px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--el-text-color-secondary);
      }
    }

    .panel-header {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .episode-items {
      .episode-item {
        padding: 12px;
        border-radius: var(--custom-radius);
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;

        &:hover {
          background: var(--el-fill-color-lighter);
        }

        &.active {
          background: var(--el-color-primary-light-9);
          border: 1px solid var(--el-color-primary-light-5);
        }

        .episode-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .episode-info {
          flex: 1;
          min-width: 0;
        }
      }
    }

    .script-content {
      .script-paragraph {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: var(--custom-radius);
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;
        background: var(--el-fill-color-lighter);

        &:hover {
          background: var(--el-fill-color);
        }

        &.selected {
          background: var(--el-color-primary-light-9);
          border: 1px solid var(--el-color-primary-light-5);
        }

        .paragraph-index {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--el-color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }

        .paragraph-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.6;
          color: var(--el-text-color-primary);
        }
      }
    }

    .shot-results {
      .shot-card {
        padding: 12px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
        margin-bottom: 8px;

        .shot-description {
          line-height: 1.5;
        }
      }
    }
  }
</style>
