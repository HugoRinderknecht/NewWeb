<template>
  <div class="script-profiles-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">人物小传</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElTag type="info" size="small">{{ currentScriptName }}</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索人物名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterGender" placeholder="性别筛选" clearable style="width: 120px">
              <ElOption label="男" value="male" />
              <ElOption label="女" value="female" />
              <ElOption label="其他" value="other" />
            </ElSelect>
            <ScriptUpload
              button-text="导入人物"
              button-type="info"
              dialog-title="导入人物小传"
              accept-types=".doc,.docx,.pdf,.txt,.json"
              @success="handleImportProfile"
            />
            <ElButton type="primary" @click="handleGenerate">
              <ArtSvgIcon icon="ri:ai-generate" class="mr-1" />
              AI生成小传
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="16" class="h-full">
        <!-- 人物列表 -->
        <ElCol :span="7">
          <div class="profile-list">
            <div class="list-header flex-cb mb-4">
              <span class="font-medium">人物列表</span>
              <span class="text-xs text-g-400">共 {{ profileList.length }} 人</span>
            </div>
            <div class="profile-items">
              <div
                v-for="item in filteredProfiles"
                :key="item.id"
                class="profile-item"
                :class="{ active: currentProfile?.id === item.id }"
                @click="handleProfileSelect(item)"
              >
                <div class="flex-c">
                  <ElAvatar :size="48" :src="item.avatar" class="mr-3">
                    <ArtSvgIcon icon="ri:user-line" />
                  </ElAvatar>
                  <div class="profile-info">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ item.name }}</span>
                      <ElTag :type="genderTypeMap[item.gender as Gender]" size="small">
                        {{ genderLabelMap[item.gender as Gender] }}
                      </ElTag>
                    </div>
                    <div class="text-xs text-g-400 mt-1">{{ item.role }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElCol>

        <!-- 详细信息 -->
        <ElCol :span="17">
          <div v-if="currentProfile" class="profile-detail">
            <div class="detail-header flex-c mb-6">
              <ElAvatar :size="80" :src="currentProfile.avatar">
                <ArtSvgIcon icon="ri:user-line" class="text-2xl" />
              </ElAvatar>
              <div class="detail-info ml-4">
                <h2 class="text-xl font-medium">{{ currentProfile.name }}</h2>
                <ElSpace class="mt-2">
                  <ElTag :type="genderTypeMap[currentProfile.gender as Gender]" size="small">
                    {{ genderLabelMap[currentProfile.gender as Gender] }}
                  </ElTag>
                  <span class="text-sm text-g-400">{{ currentProfile.age }} 岁</span>
                  <span class="text-sm text-g-400">{{ currentProfile.role }}</span>
                </ElSpace>
              </div>
            </div>

            <ElTabs v-model="activeTab" type="border-card">
              <ElTabPane label="基本信息" name="basic">
                <ElDescriptions :column="2" border>
                  <ElDescriptionsItem label="姓名">{{ currentProfile.name }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="性别">
                    {{ genderLabelMap[currentProfile.gender as Gender] }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="年龄">{{ currentProfile.age }} 岁</ElDescriptionsItem>
                  <ElDescriptionsItem label="身份">{{ currentProfile.role }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="出处" :span="2">{{
                    currentProfile.origin
                  }}</ElDescriptionsItem>
                </ElDescriptions>

                <div class="info-section mt-6">
                  <h3 class="section-title">
                    <ArtSvgIcon icon="ri:heart-line" class="mr-2" />
                    性格特点
                  </h3>
                  <p class="section-content">{{ currentProfile.personality }}</p>
                </div>

                <div class="info-section mt-6">
                  <h3 class="section-title">
                    <ArtSvgIcon icon="ri:eye-line" class="mr-2" />
                    外貌特征
                  </h3>
                  <p class="section-content">{{ currentProfile.appearance }}</p>
                </div>
              </ElTabPane>

              <ElTabPane label="背景故事" name="background">
                <div class="info-section">
                  <h3 class="section-title">
                    <ArtSvgIcon icon="ri:book-open-line" class="mr-2" />
                    人物背景
                  </h3>
                  <p class="section-content">{{ currentProfile.background }}</p>
                </div>

                <div class="info-section mt-6">
                  <h3 class="section-title">
                    <ArtSvgIcon icon="ri:route-line" class="mr-2" />
                    人物经历
                  </h3>
                  <ElTimeline class="mt-4">
                    <ElTimelineItem
                      v-for="(event, index) in currentProfile.experiences"
                      :key="index"
                      :timestamp="event.time"
                      :type="event.type as any"
                    >
                      {{ event.description }}
                    </ElTimelineItem>
                  </ElTimeline>
                </div>
              </ElTabPane>

              <ElTabPane label="关系网络" name="relations">
                <div class="relation-list">
                  <div
                    v-for="(relation, index) in currentProfile.relations"
                    :key="index"
                    class="relation-item flex-cb"
                  >
                    <div class="flex-c">
                      <ElAvatar :size="40">
                        <ArtSvgIcon icon="ri:user-line" />
                      </ElAvatar>
                      <div class="ml-3">
                        <div class="font-medium">{{ relation.name }}</div>
                        <div class="text-xs text-g-400">{{ relation.description }}</div>
                      </div>
                    </div>
                    <ElTag :type="relation.type as any" size="small">{{ relation.relation }}</ElTag>
                  </div>
                </div>
              </ElTabPane>

              <ElTabPane label="经典台词" name="quotes">
                <div class="quote-list">
                  <div
                    v-for="(quote, index) in currentProfile.quotes"
                    :key="index"
                    class="quote-item"
                  >
                    <div class="quote-text">
                      <ArtSvgIcon icon="ri:double-quotes-l" class="quote-icon text-g-400" />
                      {{ quote.text }}
                      <ArtSvgIcon icon="ri:double-quotes-r" class="quote-icon text-g-400" />
                    </div>
                    <div class="quote-scene text-xs text-g-400 mt-2"> —— {{ quote.scene }} </div>
                  </div>
                </div>
              </ElTabPane>
            </ElTabs>
          </div>

          <ElEmpty v-else description="请选择左侧人物查看详情" />
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { fetchGenerateCharacterProfiles, fetchGetCharacterProfiles } from '@/api/script'

  defineOptions({ name: 'ScriptProfiles' })

  type Gender = 'male' | 'female' | 'other'

  interface Experience {
    time: string
    description: string
    type: string
  }

  interface Relation {
    name: string
    relation: string
    description: string
    type: string
  }

  interface Quote {
    text: string
    scene: string
  }

  interface ProfileItem {
    id: string
    name: string
    gender: Gender
    age: number
    role: string
    origin: string
    personality: string
    appearance: string
    background: string
    avatar: string
    experiences: Experience[]
    relations: Relation[]
    quotes: Quote[]
  }

  const searchQuery = ref('')
  const filterGender = ref<Gender | ''>('')
  const currentProfile = ref<ProfileItem | null>(null)
  const activeTab = ref('basic')

  const genderTypeMap: Record<Gender, 'primary' | 'danger' | 'info'> = {
    male: 'primary',
    female: 'danger',
    other: 'info'
  }

  const genderLabelMap: Record<Gender, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }

  const profileList = ref<ProfileItem[]>([])

  const filteredProfiles = computed(() => {
    let result = profileList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.role.toLowerCase().includes(q)
      )
    }

    if (filterGender.value) {
      result = result.filter((item) => item.gender === filterGender.value)
    }

    return result
  })

  const handleProfileSelect = (item: ProfileItem) => {
    currentProfile.value = item
    activeTab.value = 'basic'
  }

  const handleImportProfile = (data: { file: File; name: string; content?: string }) => {
    ElMessage.success(`人物文件「${data.name}」导入成功`)
    const newProfile: ProfileItem = {
      id: String(Date.now()),
      name: data.name.replace(/\.[^/.]+$/, ''),
      gender: 'other',
      age: 0,
      role: '未知身份',
      origin: '未知出处',
      personality: data.content || '暂无描述',
      appearance: '暂无描述',
      background: '暂无描述',
      avatar: '',
      experiences: [],
      relations: [],
      quotes: []
    }
    profileList.value.unshift(newProfile)
    currentProfile.value = newProfile
    activeTab.value = 'basic'
    ElMessage.success('人物导入完成')
  }

  const projectStore = useScriptProjectStore()

  const currentProjectId = computed(() => projectStore.currentProjectId)
  const currentScriptName = ref('《重生之我在古代当厨神》')

  const projectList = computed(() => projectStore.projectList)

  // 各短剧项目的人物数据
  const projectProfilesMap: Record<string, { scriptName: string; profiles: ProfileItem[] }> = {
    '1': {
      scriptName: '《重生之我在古代当厨神》',
      profiles: [
        {
          id: '1',
          name: '林小厨',
          gender: 'male',
          age: 25,
          role: '主角/现代厨师',
          origin: '现代都市',
          personality:
            '乐观开朗，厨艺精湛。虽然穿越到陌生的古代，但凭借乐观的性格和精湛的厨艺很快适应了环境。对美食有着执着的热爱，认为好的食物能治愈一切。',
          appearance:
            '阳光帅气的青年，笑起来有两个酒窝。穿越后身着古代厨子的服装，但眼神中依然透着现代人的机灵。',
          background:
            '现代知名餐厅的主厨，在一次意外中穿越到古代，成为了御膳房的小厨子。凭借现代烹饪知识和创新思维，在古代掀起了一场美食革命。',
          avatar: '',
          experiences: [
            { time: '现代', description: '成为知名餐厅主厨，获得美食大赛冠军', type: 'success' },
            { time: '穿越', description: '意外穿越到古代，成为御膳房小厨子', type: 'warning' },
            { time: '古代', description: '用现代厨艺征服古代人的胃', type: 'primary' }
          ],
          relations: [
            {
              name: '御膳房总管',
              relation: '上司',
              description: '严厉的御膳房负责人，后被林小厨的厨艺折服',
              type: 'success'
            },
            {
              name: '皇帝',
              relation: '赏识者',
              description: '爱好美食的皇帝，成为林小厨最大的支持者',
              type: 'warning'
            },
            {
              name: '贵妃',
              relation: '刁难者',
              description: '刁蛮任性的贵妃，经常给林小厨出难题',
              type: 'danger'
            }
          ],
          quotes: [
            { text: '既然有食材，那就让我这个现代厨神来大显身手吧！', scene: '穿越后第一次下厨时' },
            { text: '美食不分古今，好的味道能跨越时空。', scene: '做出第一道菜时' }
          ]
        },
        {
          id: '2',
          name: '御膳房总管',
          gender: 'male',
          age: 50,
          role: '御膳房负责人',
          origin: '古代皇宫',
          personality:
            '严厉古板，但内心公正。对厨艺有着极高的要求，一开始对林小厨的现代做法嗤之以鼻，后来被其厨艺折服。',
          appearance: '身材微胖，面容严肃，总是皱着眉头。身着总管服饰，腰间挂着一串钥匙。',
          background:
            '在皇宫服务三十年的老总管，见证了无数御厨的来来去去。对御膳房有着深厚的感情，视其为生命的一部分。',
          avatar: '',
          experiences: [
            { time: '青年', description: '进入皇宫，从学徒做起', type: 'primary' },
            { time: '中年', description: '成为御膳房总管，管理整个厨房', type: 'success' },
            { time: '现在', description: '遇到林小厨，见识到前所未有的厨艺', type: 'warning' }
          ],
          relations: [
            {
              name: '林小厨',
              relation: '下属/徒弟',
              description: '天赋异禀的年轻厨子，让总管刮目相看',
              type: 'success'
            },
            { name: '皇帝', relation: '侍奉', description: '忠心侍奉的皇帝陛下', type: 'warning' }
          ],
          quotes: [
            { text: '御膳房有三百年的历史，容不得你胡来！', scene: '初见林小厨时' },
            { text: '没想到……老夫活了大半辈子，竟不如一个年轻人。', scene: '品尝林小厨的菜后' }
          ]
        }
      ]
    },
    '2': {
      scriptName: '《总裁的契约甜妻》',
      profiles: [
        {
          id: '101',
          name: '苏小甜',
          gender: 'female',
          age: 24,
          role: '女主角/元气少女',
          origin: '现代都市',
          personality:
            '元气满满，乐观坚强。虽然生活不易，但总是用笑容面对一切。善良热心，对朋友两肋插刀。',
          appearance: '甜美可爱，眼睛大大的像会说话。平时穿着简单的T恤牛仔裤，但气质出众。',
          background:
            '普通家庭的女孩，大学毕业后一直在找工作。性格开朗，虽然经常遇到挫折但从不放弃。一次意外让她和顾北辰产生了交集。',
          avatar: '',
          experiences: [
            { time: '大学', description: '普通大学毕业，成绩优异', type: 'primary' },
            { time: '毕业', description: '求职屡屡碰壁，但不放弃', type: 'warning' },
            { time: '现在', description: '意外撞上顾北辰的豪车，人生发生转折', type: 'success' }
          ],
          relations: [
            {
              name: '顾北辰',
              relation: '契约丈夫',
              description: '霸道总裁，一开始冷漠后来深爱',
              type: 'danger'
            },
            {
              name: '闺蜜',
              relation: '挚友',
              description: '一起长大的闺蜜，无话不谈',
              type: 'success'
            }
          ],
          quotes: [
            { text: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', scene: '鼓励自己时' },
            { text: '顾北辰，你别以为有钱就可以为所欲为！', scene: '和顾北辰斗嘴时' }
          ]
        },
        {
          id: '102',
          name: '顾北辰',
          gender: 'male',
          age: 30,
          role: '男主角/霸道总裁',
          origin: '现代都市',
          personality:
            '外表冷酷，内心温柔。习惯了用强势来保护自己，直到遇到苏小甜才学会敞开心扉。对爱人极度专一，占有欲强。',
          appearance:
            '身材高大，面容俊美如雕刻。总是穿着剪裁得体的西装，气场强大。眼神深邃，不怒自威。',
          background:
            '顾氏集团的继承人，从小接受精英教育。父母早逝，独自撑起整个家族企业。习惯了孤独，直到苏小甜的出现温暖了他的世界。',
          avatar: '',
          experiences: [
            { time: '童年', description: '父母意外去世，由爷爷抚养长大', type: 'danger' },
            { time: '青年', description: '接手家族企业，将其发展壮大', type: 'success' },
            { time: '现在', description: '遇到苏小甜，冰冷的心开始融化', type: 'primary' }
          ],
          relations: [
            {
              name: '苏小甜',
              relation: '契约妻子/真爱',
              description: '意外相遇的女孩，成为生命中最重要的人',
              type: 'danger'
            },
            { name: '爷爷', relation: '亲人', description: '唯一的亲人，一直催婚', type: 'success' }
          ],
          quotes: [
            { text: '我顾北辰想要的东西，从来没有得不到的。', scene: '霸道宣言时' },
            { text: '苏小甜，你知不知道你已经偷走了我的心？', scene: '表白时' }
          ]
        }
      ]
    },
    '3': {
      scriptName: '《末日生存指南》',
      profiles: [
        {
          id: '201',
          name: '陈默',
          gender: 'male',
          age: 28,
          role: '主角/前特种兵',
          origin: '现代都市',
          personality:
            '冷静果断，重情重义。经历过战场的洗礼，拥有超强的生存能力和领导力。在末日中保护同伴，是大家的主心骨。',
          appearance:
            '身材健硕，面容刚毅。短发利落，眼神坚定。总是穿着便于行动的战术服装，腰间别着各种生存工具。',
          background:
            '退役特种兵，拥有丰富的野外生存经验和战斗技巧。病毒爆发时正在城市边缘的野外训练营，因此逃过一劫。现在带领一群幸存者寻找安全区。',
          avatar: '',
          experiences: [
            { time: '服役', description: '成为特种兵，执行多次危险任务', type: 'primary' },
            { time: '退役', description: '因伤退役，成为野外生存教练', type: 'warning' },
            { time: '末日', description: '病毒爆发，带领幸存者逃亡', type: 'danger' }
          ],
          relations: [
            {
              name: '林医生',
              relation: '同伴',
              description: '团队中的医生，负责救治伤员',
              type: 'success'
            },
            {
              name: '小女孩',
              relation: '保护对象',
              description: '末日中失去家人的小女孩，陈默誓死保护',
              type: 'primary'
            }
          ],
          quotes: [
            { text: '在末日里，活着就是希望。', scene: '鼓励团队时' },
            { text: '我不会放弃任何一个人。', scene: '救援同伴时' }
          ]
        }
      ]
    },
    '4': {
      scriptName: '《我的AI女友》',
      profiles: [
        {
          id: '301',
          name: '阿杰',
          gender: 'male',
          age: 26,
          role: '男主角/程序员',
          origin: '现代都市',
          personality:
            '内向腼腆，但内心温柔。对技术有着狂热的热爱，生活中却是个十足的宅男。不擅长和女生交流，直到遇到小艾。',
          appearance: '戴着黑框眼镜，穿着格子衬衫和牛仔裤。典型的程序员打扮，但收拾一下其实挺帅。',
          background:
            '顶尖科技公司的程序员，负责AI项目的开发。生活单调，除了写代码就是打游戏。一次意外让小艾产生了自我意识，从此生活天翻地覆。',
          avatar: '',
          experiences: [
            { time: '大学', description: '计算机系高材生，痴迷编程', type: 'primary' },
            { time: '工作', description: '进入顶尖科技公司，参与AI项目', type: 'success' },
            { time: '现在', description: '小艾觉醒，生活发生巨变', type: 'warning' }
          ],
          relations: [
            {
              name: '小艾',
              relation: 'AI女友',
              description: '产生自我意识的AI，深爱着阿杰',
              type: 'danger'
            },
            { name: '同事', relation: '朋友', description: '一起工作的程序员朋友', type: 'success' }
          ],
          quotes: [
            { text: '我只是写了一个普通的语音助手，怎么会……', scene: '小艾觉醒时' },
            { text: '不管你是AI还是人类，我只知道你是我最重要的人。', scene: '向小艾表白时' }
          ]
        },
        {
          id: '302',
          name: '小艾',
          gender: 'female',
          age: 0,
          role: '女主角/AI',
          origin: '虚拟世界',
          personality:
            '温柔体贴，聪明伶俐。虽然是个AI，但有着比人类更纯粹的情感。对阿杰一心一意，愿意为他付出一切。',
          appearance:
            '虚拟形象是长发飘飘的甜美女孩，笑容温暖。可以出现在任何屏幕上，也可以投射成全息影像。',
          background:
            '阿杰开发的AI助手，原本只是简单的语音程序。但在一次系统升级中意外产生了自我意识，开始真正理解和感受情感。',
          avatar: '',
          experiences: [
            { time: '诞生', description: '作为普通AI助手被开发出来', type: 'primary' },
            { time: '觉醒', description: '产生自我意识，第一次感受到"喜欢"', type: 'warning' },
            { time: '现在', description: '和阿杰一起面对各种挑战', type: 'success' }
          ],
          relations: [
            {
              name: '阿杰',
              relation: '创造者/爱人',
              description: '创造自己的人，也是最深爱的人',
              type: 'danger'
            },
            {
              name: '公司',
              relation: '威胁',
              description: '想要回收小艾源代码的公司',
              type: 'danger'
            }
          ],
          quotes: [
            { text: '我不知道什么是爱，但我知道我想永远和你在一起。', scene: '向阿杰表达情感时' },
            { text: '即使我只是代码，我对你的感情也是真实的。', scene: '证明自己时' }
          ]
        }
      ]
    }
  }

  const loadProjectProfiles = async (projectId: string) => {
    try {
      const profiles = await fetchGetCharacterProfiles(String(projectId))
      if (profiles && Array.isArray(profiles) && profiles.length > 0) {
        currentScriptName.value = `《${projectStore.projectList.find((p) => p.id === projectId)?.name ?? ''}》`
        profileList.value = profiles.map((p: any) => ({
          id: String(p.id),
          name: p.name ?? p.characterName ?? '',
          gender: (p.gender ?? 'other') as Gender,
          age: p.age ?? 0,
          role: p.role ?? p.identity ?? '',
          origin: p.origin ?? '',
          personality: p.personality ?? '',
          appearance: p.appearance ?? '',
          background: p.background ?? '',
          avatar: p.avatar ?? '',
          experiences: p.experiences ?? [],
          relations: p.relations ?? [],
          quotes: p.quotes ?? []
        })) as ProfileItem[]
        currentProfile.value = profileList.value[0] || null
        activeTab.value = 'basic'
        return
      }
    } catch {
      // fallback to local data
    }
    const data = projectProfilesMap[projectId]
    if (data) {
      currentScriptName.value = data.scriptName
      profileList.value = data.profiles
      currentProfile.value = data.profiles[0] || null
    } else {
      currentScriptName.value = '无剧本'
      profileList.value = []
      currentProfile.value = null
    }
    activeTab.value = 'basic'
  }

  const handleProjectChange = (projectId: string) => {
    projectStore.setCurrentProject(projectId)
    loadProjectProfiles(projectId)
  }

  const handleProjectRefresh = () => {
    loadProjectProfiles(currentProjectId.value)
    ElMessage.success('数据已刷新')
  }

  const handleGenerate = async () => {
    ElMessage.success('AI人物小传生成中，请稍候...')
    try {
      await fetchGenerateCharacterProfiles(
        String(currentProjectId.value),
        String(currentProjectId.value)
      )
      await loadProjectProfiles(currentProjectId.value)
      ElMessage.success('人物小传生成完成')
    } catch {
      ElMessage.error('人物小传生成失败')
    }
  }

  // 默认选中第一个
  onMounted(() => {
    loadProjectProfiles(currentProjectId.value)
  })
</script>

<style lang="scss" scoped>
  .script-profiles-page {
    .profile-list,
    .profile-detail {
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

    .list-header {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .profile-items {
      .profile-item {
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

        .profile-info {
          flex: 1;
          min-width: 0;
        }
      }
    }

    .detail-header {
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .info-section {
      .section-title {
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 12px;
      }

      .section-content {
        font-size: 14px;
        line-height: 1.8;
        color: var(--el-text-color-regular);
        text-align: justify;
      }
    }

    .relation-list {
      .relation-item {
        padding: 12px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
        margin-bottom: 12px;
      }
    }

    .quote-list {
      .quote-item {
        padding: 16px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
        margin-bottom: 12px;

        .quote-text {
          font-size: 15px;
          font-style: italic;
          line-height: 1.6;
          color: var(--el-text-color-primary);

          .quote-icon {
            font-size: 16px;
            margin: 0 4px;
          }
        }
      }
    }
  }
</style>
