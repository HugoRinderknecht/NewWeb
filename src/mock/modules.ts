import { MockMethod } from 'vite-plugin-mock'

function successResponse(data: unknown = null, message = 'success') {
  return { code: 200, message, data, timestamp: Date.now() }
}

function paginatedResponse(records: unknown[] = [], total = 0, page = 1, pageSize = 20) {
  const totalPages = Math.ceil(total / pageSize)
  return successResponse({
    records,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    first: page === 1,
    last: page >= totalPages,
    currentSize: records.length,
    empty: records.length === 0
  })
}

// ==================== 共享数据常量 ====================

const PROJECT_ID = '1'

const projects = [
  { id: '1', name: '《重生之我在古代当厨神》', projectName: '《重生之我在古代当厨神》', description: '现代厨师林小厨意外穿越到古代，凭借精湛厨艺征服宫廷的爆笑美食短剧', type: 'animation', owner: '张制片', ownerName: '张制片', status: 'progress', progress: 68, coverImage: '', cover: '', updateTime: '2024-06-15', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T08:30:00Z', memberCount: 5, assetCount: 156 },
  { id: '2', name: '《总裁的契约甜妻》', projectName: '《总裁的契约甜妻》', description: '霸道总裁与元气少女的甜蜜契约爱情故事', type: 'video', owner: '李导演', ownerName: '李导演', status: 'progress', progress: 45, coverImage: '', cover: '', updateTime: '2024-06-10', createdAt: '2024-02-15T00:00:00Z', updatedAt: '2024-06-10T14:20:00Z', memberCount: 6, assetCount: 89 },
  { id: '3', name: '《仙侠奇缘录》', projectName: '《仙侠奇缘录》', description: '少年修仙问道，历经磨难终成大道的热血仙侠故事', type: 'animation', owner: '王编剧', ownerName: '王编剧', status: 'completed', progress: 100, coverImage: '', cover: '', updateTime: '2024-05-20', createdAt: '2023-11-01T00:00:00Z', updatedAt: '2024-05-20T16:00:00Z', memberCount: 10, assetCount: 234 },
  { id: '4', name: '《都市修仙传》', projectName: '《都市修仙传》', description: '现代都市中隐藏的修仙者，低调生活却卷入各种纷争', type: 'storyboard', owner: '赵制片', ownerName: '赵制片', status: 'paused', progress: 32, coverImage: '', cover: '', updateTime: '2024-04-18', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-04-18T10:45:00Z', memberCount: 5, assetCount: 67 },
  { id: '5', name: '《萌宠大作战》', projectName: '《萌宠大作战》', description: '可爱宠物们的欢乐日常，治愈系动画短片', type: 'animation', owner: '刘美术', ownerName: '刘美术', status: 'progress', progress: 82, coverImage: '', cover: '', updateTime: '2024-06-12', createdAt: '2024-04-10T00:00:00Z', updatedAt: '2024-06-12T09:15:00Z', memberCount: 4, assetCount: 198 },
  { id: '6', name: '《末日求生日记》', projectName: '《末日求生日记》', description: '末日废墟中的生存冒险，展现人性的光辉与黑暗', type: 'video', owner: '孙导演', ownerName: '孙导演', status: 'archived', progress: 100, coverImage: '', cover: '', updateTime: '2024-03-25', createdAt: '2023-09-15T00:00:00Z', updatedAt: '2024-03-25T18:00:00Z', memberCount: 12, assetCount: 345 }
]

const projectDetail = {
  id: '1', name: '《重生之我在古代当厨神》', description: '现代厨师林小厨意外穿越到古代，凭借精湛厨艺征服宫廷的爆笑美食短剧', status: 'progress', coverImage: '', ownerId: '1', ownerName: '张制片', teamId: '1', teamName: '创意工作室', archived: false, deleted: false,
  config: { artStyle: 'anime', colorTone: 'warm', characterStyle: 'cute', sceneStyle: 'detailed', resolution: '1920x1080', frameRate: 24, language: 'zh-CN' },
  memberCount: 5, storyboardCount: 24, scriptCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T08:30:00Z'
}

const members = [
  { id: '1', userId: '1', userName: '张制片', avatar: '', role: 'owner', joinTime: '2024-01-01T00:00:00Z' },
  { id: '2', userId: '2', userName: '李导演', avatar: '', role: 'editor', joinTime: '2024-01-05T00:00:00Z' },
  { id: '3', userId: '3', userName: '王编剧', avatar: '', role: 'editor', joinTime: '2024-01-10T00:00:00Z' },
  { id: '4', userId: '4', userName: '刘美术', avatar: '', role: 'viewer', joinTime: '2024-02-01T00:00:00Z' },
  { id: '5', userId: '5', userName: '赵剪辑', avatar: '', role: 'editor', joinTime: '2024-03-15T00:00:00Z' }
]

const episodes = [
  { id: '1', episodeNumber: 1, number: 1, name: '穿越了？我是厨神？', projectId: '1', status: 'completed', wordCount: 4200, duration: 15, author: '王编剧', updateTime: '2024-06-15' },
  { id: '2', episodeNumber: 2, number: 2, name: '第一道招牌菜', projectId: '1', status: 'completed', wordCount: 3800, duration: 15, author: '王编剧', updateTime: '2024-06-14' },
  { id: '3', episodeNumber: 3, number: 3, name: '宫廷美食大赛', projectId: '1', status: 'writing', wordCount: 2100, duration: 15, author: '王编剧', updateTime: '2024-06-13' },
  { id: '4', episodeNumber: 4, number: 4, name: '御厨对决', projectId: '1', status: 'writing', wordCount: 1500, duration: 15, author: '王编剧', updateTime: '2024-06-12' },
  { id: '5', episodeNumber: 5, number: 5, name: '深夜偷吃记', projectId: '1', status: 'draft', wordCount: 0, duration: 15, author: '王编剧', updateTime: '2024-06-11' },
  { id: '6', episodeNumber: 6, number: 6, name: '皇帝的考验', projectId: '1', status: 'draft', wordCount: 0, duration: 15, author: '王编剧', updateTime: '2024-06-10' },
  { id: '7', episodeNumber: 1, number: 1, name: '契约的开始', projectId: '2', status: 'completed', wordCount: 4500, duration: 20, author: '李导演', updateTime: '2024-06-10' },
  { id: '8', episodeNumber: 2, number: 2, name: '同居风波', projectId: '2', status: 'writing', wordCount: 2800, duration: 20, author: '李导演', updateTime: '2024-06-09' },
  { id: '9', episodeNumber: 3, number: 3, name: '心动瞬间', projectId: '2', status: 'draft', wordCount: 0, duration: 20, author: '李导演', updateTime: '2024-06-08' },
  { id: '10', episodeNumber: 1, number: 1, name: '初入仙门', projectId: '3', status: 'completed', wordCount: 5200, duration: 25, author: '王编剧', updateTime: '2024-05-15' },
  { id: '11', episodeNumber: 2, number: 2, name: '灵根觉醒', projectId: '3', status: 'completed', wordCount: 4800, duration: 25, author: '王编剧', updateTime: '2024-05-10' },
  { id: '12', episodeNumber: 3, number: 3, name: '仙魔大战', projectId: '3', status: 'completed', wordCount: 5500, duration: 25, author: '王编剧', updateTime: '2024-05-05' },
  { id: '13', episodeNumber: 1, number: 1, name: '都市异变', projectId: '4', status: 'writing', wordCount: 3200, duration: 20, author: '赵制片', updateTime: '2024-04-15' },
  { id: '14', episodeNumber: 1, number: 1, name: '萌宠登场', projectId: '5', status: 'completed', wordCount: 3000, duration: 12, author: '刘美术', updateTime: '2024-06-08' },
  { id: '15', episodeNumber: 2, number: 2, name: '猫咪大冒险', projectId: '5', status: 'writing', wordCount: 1800, duration: 12, author: '刘美术', updateTime: '2024-06-05' },
  { id: '16', episodeNumber: 1, number: 1, name: '末日降临', projectId: '6', status: 'completed', wordCount: 6000, duration: 30, author: '孙导演', updateTime: '2024-03-20' },
  { id: '17', episodeNumber: 2, number: 2, name: '废墟求生', projectId: '6', status: 'completed', wordCount: 5800, duration: 30, author: '孙导演', updateTime: '2024-03-15' }
]

const scripts = [
  { id: '1', name: '《重生之我在古代当厨神》第一集', code: 'SCRIPT-001', status: 'completed', wordCount: 4200, duration: 15, author: '王编剧', updateTime: '2024-06-15', projectId: '1' },
  { id: '2', name: '《重生之我在古代当厨神》第二集', code: 'SCRIPT-002', status: 'completed', wordCount: 3800, duration: 15, author: '王编剧', updateTime: '2024-06-14', projectId: '1' },
  { id: '3', name: '《重生之我在古代当厨神》第三集', code: 'SCRIPT-003', status: 'writing', wordCount: 2100, duration: 15, author: '王编剧', updateTime: '2024-06-13', projectId: '1' },
  { id: '4', name: '《重生之我在古代当厨神》第四集', code: 'SCRIPT-004', status: 'writing', wordCount: 1500, duration: 15, author: '王编剧', updateTime: '2024-06-12', projectId: '1' },
  { id: '5', name: '《重生之我在古代当厨神》第五集', code: 'SCRIPT-005', status: 'draft', wordCount: 0, duration: 15, author: '王编剧', updateTime: '2024-06-11', projectId: '1' },
  { id: '6', name: '《重生之我在古代当厨神》第六集', code: 'SCRIPT-006', status: 'draft', wordCount: 0, duration: 15, author: '王编剧', updateTime: '2024-06-10', projectId: '1' },
  { id: '7', name: '《总裁的契约甜妻》第一集', code: 'SCRIPT-007', status: 'completed', wordCount: 4500, duration: 20, author: '李导演', updateTime: '2024-06-10', projectId: '2' },
  { id: '8', name: '《总裁的契约甜妻》第二集', code: 'SCRIPT-008', status: 'writing', wordCount: 2800, duration: 20, author: '李导演', updateTime: '2024-06-09', projectId: '2' },
  { id: '9', name: '《总裁的契约甜妻》第三集', code: 'SCRIPT-009', status: 'draft', wordCount: 0, duration: 20, author: '李导演', updateTime: '2024-06-08', projectId: '2' },
  { id: '10', name: '《仙侠奇缘录》第一集', code: 'SCRIPT-010', status: 'completed', wordCount: 5200, duration: 25, author: '王编剧', updateTime: '2024-05-15', projectId: '3' },
  { id: '11', name: '《仙侠奇缘录》第二集', code: 'SCRIPT-011', status: 'completed', wordCount: 4800, duration: 25, author: '王编剧', updateTime: '2024-05-10', projectId: '3' },
  { id: '12', name: '《仙侠奇缘录》第三集', code: 'SCRIPT-012', status: 'completed', wordCount: 5500, duration: 25, author: '王编剧', updateTime: '2024-05-05', projectId: '3' },
  { id: '13', name: '《都市修仙传》第一集', code: 'SCRIPT-013', status: 'writing', wordCount: 3200, duration: 20, author: '赵制片', updateTime: '2024-04-15', projectId: '4' },
  { id: '14', name: '《萌宠大作战》第一集', code: 'SCRIPT-014', status: 'completed', wordCount: 3000, duration: 12, author: '刘美术', updateTime: '2024-06-08', projectId: '5' },
  { id: '15', name: '《萌宠大作战》第二集', code: 'SCRIPT-015', status: 'writing', wordCount: 1800, duration: 12, author: '刘美术', updateTime: '2024-06-05', projectId: '5' },
  { id: '16', name: '《末日求生日记》第一集', code: 'SCRIPT-016', status: 'completed', wordCount: 6000, duration: 30, author: '孙导演', updateTime: '2024-03-20', projectId: '6' },
  { id: '17', name: '《末日求生日记》第二集', code: 'SCRIPT-017', status: 'completed', wordCount: 5800, duration: 30, author: '孙导演', updateTime: '2024-03-15', projectId: '6' }
]

const scriptDetailContent = `第一集：穿越了？我是厨神？

场景一：现代·林小厨私房菜馆·夜

（灯火通明的厨房内，林小厨正在精心烹制一道松茸炖鸡。）

林小厨：（自言自语）松茸要先用黄油煎出香气，再入砂锅慢炖三个小时……完美！

（手机突然响起，是美食比赛的获奖通知。）

林小厨：（激动）什么？我获得了全国厨艺大赛金奖？！

（林小厨兴奋地跳起来，不小心碰倒了灶台上的老抽瓶，脚下打滑，一头撞向灶台——）

场景二：古代·山间小路·日

（画面一转，林小厨穿着围裙，一脸茫然地躺在一条青石小路上。）

林小厨：（揉着头）这是……哪儿？

路过的老农：（惊讶）这后生穿的什么衣裳？

林小厨：等等，我的厨房呢？我的松茸炖鸡呢？！

（远处传来敲锣声。）

村民甲：快去看啊！御膳房在招厨子！

林小厨：（眼睛一亮）御膳房？招厨子？先找个地方做饭再说！

——第一集完——`

const storyboards = [
  { id: '1', code: 'SB-001', name: '开场·山巅俯瞰', source: 'script', sceneId: 1, sceneName: '青丘山', description: '主角阿禹站在青丘山巅，俯瞰大地，风吹衣袂', thumbnail: '', shotCount: 3, duration: 15, status: 'completed', order: 1, projectId: '1' },
  { id: '2', code: 'SB-002', name: '九尾狐现身', source: 'ai', sceneId: 1, sceneName: '青丘山', description: '九尾狐从竹林中缓缓走出，九条尾巴摇曳生姿', thumbnail: '', shotCount: 5, duration: 25, status: 'designing', order: 2, projectId: '1' },
  { id: '3', code: 'SB-003', name: '厨房初试身手', source: 'script', sceneId: 2, sceneName: '御膳房', description: '林小厨在御膳房第一次展示厨艺，惊呆众人', thumbnail: '', shotCount: 4, duration: 20, status: 'completed', order: 3, projectId: '1' },
  { id: '4', code: 'SB-004', name: '宫廷御膳对决', source: 'script', sceneId: 2, sceneName: '御膳房', description: '林小厨与御厨展开激烈的厨艺对决', thumbnail: '', shotCount: 6, duration: 30, status: 'completed', order: 4, projectId: '1' },
  { id: '5', code: 'SB-005', name: '竹林追逐', source: 'ai', sceneId: 3, sceneName: '竹林', description: '主角在竹林中被追兵追赶，施展轻功逃脱', thumbnail: '', shotCount: 8, duration: 35, status: 'designing', order: 5, projectId: '1' },
  { id: '6', code: 'SB-006', name: '月下告白', source: 'script', sceneId: 3, sceneName: '竹林', description: '月光下，男女主角在竹林中互诉衷肠', thumbnail: '', shotCount: 3, duration: 15, status: 'pending', order: 6, projectId: '1' },
  { id: '7', code: 'SB-007', name: '大结局·凯旋归来', source: 'script', sceneId: 1, sceneName: '青丘山', description: '主角历经磨难后凯旋归来，众人欢庆', thumbnail: '', shotCount: 5, duration: 25, status: 'pending', order: 7, projectId: '1' },
  { id: '8', code: 'SB-008', name: '彩蛋·番外篇', source: 'ai', sceneId: 2, sceneName: '御膳房', description: '番外搞笑片段，林小厨教古人做现代菜', thumbnail: '', shotCount: 2, duration: 10, status: 'pending', order: 8, projectId: '1' },
  { id: '9', code: 'SB-009', name: '穿越瞬间·光芒', source: 'ai', sceneId: 4, sceneName: '现代厨房', description: '林小厨被光芒吞噬，时空扭曲的震撼画面', thumbnail: '', shotCount: 4, duration: 18, status: 'completed', order: 1, projectId: '1' },
  { id: '10', code: 'SB-010', name: '古代集市·初见', source: 'script', sceneId: 5, sceneName: '古代集市', description: '林小厨穿越后第一次走进热闹的古代集市，目瞪口呆', thumbnail: '', shotCount: 6, duration: 28, status: 'designing', order: 2, projectId: '1' },
  { id: '11', code: 'SB-011', name: '松茸炖鸡·特写', source: 'ai', sceneId: 2, sceneName: '御膳房', description: '松茸炖鸡的极致特写，金色汤汁翻滚，蒸汽升腾', thumbnail: '', shotCount: 3, duration: 12, status: 'completed', order: 3, projectId: '1' },
  { id: '12', code: 'SB-012', name: '皇帝品菜·龙颜大悦', source: 'script', sceneId: 6, sceneName: '金銮殿', description: '皇帝品尝林小厨的菜品后龙颜大悦，满朝文武惊叹', thumbnail: '', shotCount: 5, duration: 22, status: 'reviewing', order: 4, projectId: '1' },
  { id: '13', code: 'SB-013', name: '深夜偷吃·被抓包', source: 'script', sceneId: 2, sceneName: '御膳房', description: '林小厨深夜偷吃自己做的宵夜，被总管抓个正着', thumbnail: '', shotCount: 4, duration: 16, status: 'pending', order: 5, projectId: '1' },
  { id: '14', code: 'SB-014', name: '御膳房晨曦', source: 'ai', sceneId: 2, sceneName: '御膳房', description: '清晨第一缕阳光照进御膳房，炊烟袅袅的宁静画面', thumbnail: '', shotCount: 2, duration: 10, status: 'completed', order: 6, projectId: '1' },
  { id: '15', code: 'SB-015', name: '契约签署', source: 'script', sceneId: 7, sceneName: '总裁办公室', description: '男女主角在豪华办公室签署契约，气氛微妙', thumbnail: '', shotCount: 4, duration: 20, status: 'completed', order: 1, projectId: '2' },
  { id: '16', code: 'SB-016', name: '雨中邂逅', source: 'ai', sceneId: 8, sceneName: '城市街道', description: '暴雨中男主角为女主角撑伞，浪漫邂逅', thumbnail: '', shotCount: 5, duration: 25, status: 'designing', order: 2, projectId: '2' },
  { id: '17', code: 'SB-017', name: '同居日常·早餐', source: 'script', sceneId: 9, sceneName: '公寓客厅', description: '两人同居后的第一个早晨，手忙脚乱做早餐', thumbnail: '', shotCount: 3, duration: 15, status: 'completed', order: 3, projectId: '2' },
  { id: '18', code: 'SB-018', name: '误会与争吵', source: 'script', sceneId: 7, sceneName: '总裁办公室', description: '因误会引发激烈争吵，女主角含泪离去', thumbnail: '', shotCount: 6, duration: 30, status: 'reviewing', order: 4, projectId: '2' },
  { id: '19', code: 'SB-019', name: '天台告白', source: 'ai', sceneId: 10, sceneName: '公司天台', description: '夕阳下男主角在天台深情告白，城市天际线为背景', thumbnail: '', shotCount: 4, duration: 20, status: 'pending', order: 5, projectId: '2' },
  { id: '20', code: 'SB-020', name: '仙门入门·拜师', source: 'script', sceneId: 11, sceneName: '青云山', description: '少年在青云山拜入仙门，长老考核的庄严场面', thumbnail: '', shotCount: 5, duration: 25, status: 'completed', order: 1, projectId: '3' },
  { id: '21', code: 'SB-021', name: '灵根觉醒·异象', source: 'ai', sceneId: 11, sceneName: '青云山', description: '主角灵根觉醒，天地异象频发，五彩祥云汇聚', thumbnail: '', shotCount: 7, duration: 35, status: 'completed', order: 2, projectId: '3' },
  { id: '22', code: 'SB-022', name: '仙魔大战·决战', source: 'script', sceneId: 12, sceneName: '魔界深渊', description: '仙魔两族决战，主角力挽狂澜的史诗场面', thumbnail: '', shotCount: 10, duration: 45, status: 'designing', order: 3, projectId: '3' },
  { id: '23', code: 'SB-023', name: '修仙日常·炼丹', source: 'ai', sceneId: 13, sceneName: '丹房', description: '主角在丹房炼丹，丹炉中灵光闪烁的特写', thumbnail: '', shotCount: 3, duration: 15, status: 'completed', order: 4, projectId: '3' },
  { id: '24', code: 'SB-024', name: '都市夜战', source: 'ai', sceneId: 14, sceneName: '城市夜景', description: '修仙者在现代都市夜空中御剑飞行，霓虹闪烁', thumbnail: '', shotCount: 5, duration: 22, status: 'designing', order: 1, projectId: '4' },
  { id: '25', code: 'SB-025', name: '地铁除妖', source: 'script', sceneId: 15, sceneName: '地铁车厢', description: '主角在拥挤的地铁中暗中除妖，普通人浑然不觉', thumbnail: '', shotCount: 4, duration: 18, status: 'pending', order: 2, projectId: '4' },
  { id: '26', code: 'SB-026', name: '萌宠登场·猫咪', source: 'script', sceneId: 16, sceneName: '温馨小屋', description: '小橘猫第一次出现在主角家门口，歪头卖萌', thumbnail: '', shotCount: 3, duration: 12, status: 'completed', order: 1, projectId: '5' },
  { id: '27', code: 'SB-027', name: '宠物派对', source: 'ai', sceneId: 17, sceneName: '宠物公园', description: '各种萌宠在公园里开派对，欢乐混乱的场面', thumbnail: '', shotCount: 6, duration: 25, status: 'completed', order: 2, projectId: '5' },
  { id: '28', code: 'SB-028', name: '猫咪大冒险·屋顶', source: 'ai', sceneId: 18, sceneName: '城市屋顶', description: '小橘猫在屋顶上冒险，俯瞰整个城市的壮观画面', thumbnail: '', shotCount: 4, duration: 18, status: 'designing', order: 3, projectId: '5' },
  { id: '29', code: 'SB-029', name: '末日降临·城市崩塌', source: 'script', sceneId: 19, sceneName: '废墟城市', description: '末日来临，城市建筑纷纷崩塌，人群四散奔逃', thumbnail: '', shotCount: 8, duration: 40, status: 'completed', order: 1, projectId: '6' },
  { id: '30', code: 'SB-030', name: '废墟求生·搜寻物资', source: 'script', sceneId: 19, sceneName: '废墟城市', description: '主角在废墟中搜寻食物和水源，危机四伏', thumbnail: '', shotCount: 5, duration: 25, status: 'completed', order: 2, projectId: '6' },
  { id: '31', code: 'SB-031', name: '幸存者营地', source: 'ai', sceneId: 20, sceneName: '地下避难所', description: '幸存者在地下避难所建立营地，篝火映照着疲惫的面容', thumbnail: '', shotCount: 4, duration: 20, status: 'designing', order: 3, projectId: '6' },
  { id: '32', code: 'SB-032', name: '变异生物袭击', source: 'ai', sceneId: 19, sceneName: '废墟城市', description: '变异生物在夜间袭击营地，紧张刺激的战斗场面', thumbnail: '', shotCount: 7, duration: 32, status: 'pending', order: 4, projectId: '6' }
]

const storyboardImages: Record<string, unknown[]> = {
  '1': [
    { id: 'img-001', storyboardId: '1', url: '/uploads/storyboard/sb-001-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-001-img-01.jpg', prompt: 'anime style, mountain peak, young man overlooking landscape', createdAt: '2024-06-10T10:00:00Z' },
    { id: 'img-002', storyboardId: '1', url: '/uploads/storyboard/sb-001-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-001-img-02.jpg', prompt: 'anime style, wind blowing clothes, dramatic pose', createdAt: '2024-06-10T10:05:00Z' },
    { id: 'img-003', storyboardId: '1', url: '/uploads/storyboard/sb-001-img-03.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-001-img-03.jpg', prompt: 'anime style, panoramic mountain view, sunset', createdAt: '2024-06-10T10:10:00Z' }
  ],
  '2': [
    { id: 'img-004', storyboardId: '2', url: '/uploads/storyboard/sb-002-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-002-img-01.jpg', prompt: 'anime style, nine-tailed fox emerging from bamboo forest', createdAt: '2024-06-11T14:00:00Z' },
    { id: 'img-005', storyboardId: '2', url: '/uploads/storyboard/sb-002-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-002-img-02.jpg', prompt: 'anime style, mystical fox with flowing tails', createdAt: '2024-06-11T14:05:00Z' }
  ],
  '3': [
    { id: 'img-006', storyboardId: '3', url: '/uploads/storyboard/sb-003-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-003-img-01.jpg', prompt: 'anime style, chef cooking in imperial kitchen, amazed onlookers', createdAt: '2024-06-12T09:00:00Z' },
    { id: 'img-007', storyboardId: '3', url: '/uploads/storyboard/sb-003-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-003-img-02.jpg', prompt: 'anime style, close-up of hands slicing vegetables rapidly', createdAt: '2024-06-12T09:05:00Z' },
    { id: 'img-008', storyboardId: '3', url: '/uploads/storyboard/sb-003-img-03.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-003-img-03.jpg', prompt: 'anime style, steaming dish presented on ornate plate', createdAt: '2024-06-12T09:10:00Z' },
    { id: 'img-009', storyboardId: '3', url: '/uploads/storyboard/sb-003-img-04.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-003-img-04.jpg', prompt: 'anime style, crowd of imperial chefs looking stunned', createdAt: '2024-06-12T09:15:00Z' }
  ],
  '4': [
    { id: 'img-010', storyboardId: '4', url: '/uploads/storyboard/sb-004-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-004-img-01.jpg', prompt: 'anime style, intense cooking competition, two chefs facing off', createdAt: '2024-06-12T15:00:00Z' },
    { id: 'img-011', storyboardId: '4', url: '/uploads/storyboard/sb-004-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-004-img-02.jpg', prompt: 'anime style, dramatic fire in wok, chef tossing ingredients', createdAt: '2024-06-12T15:05:00Z' }
  ],
  '9': [
    { id: 'img-012', storyboardId: '9', url: '/uploads/storyboard/sb-009-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-009-img-01.jpg', prompt: 'anime style, bright light swallowing character, time distortion', createdAt: '2024-06-08T11:00:00Z' },
    { id: 'img-013', storyboardId: '9', url: '/uploads/storyboard/sb-009-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-009-img-02.jpg', prompt: 'anime style, swirling portal, clothes transforming', createdAt: '2024-06-08T11:05:00Z' },
    { id: 'img-014', storyboardId: '9', url: '/uploads/storyboard/sb-009-img-03.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-009-img-03.jpg', prompt: 'anime style, falling through time tunnel, dramatic lighting', createdAt: '2024-06-08T11:10:00Z' },
    { id: 'img-015', storyboardId: '9', url: '/uploads/storyboard/sb-009-img-04.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-009-img-04.jpg', prompt: 'anime style, landing in ancient world, shocked expression', createdAt: '2024-06-08T11:15:00Z' }
  ],
  '11': [
    { id: 'img-016', storyboardId: '11', url: '/uploads/storyboard/sb-011-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-011-img-01.jpg', prompt: 'anime style, extreme close-up of golden soup, steam rising', createdAt: '2024-06-09T16:00:00Z' },
    { id: 'img-017', storyboardId: '11', url: '/uploads/storyboard/sb-011-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-011-img-02.jpg', prompt: 'anime style, matsutake mushroom in soup, glistening broth', createdAt: '2024-06-09T16:05:00Z' },
    { id: 'img-018', storyboardId: '11', url: '/uploads/storyboard/sb-011-img-03.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-011-img-03.jpg', prompt: 'anime style, ceramic pot on stove, bubbling soup', createdAt: '2024-06-09T16:10:00Z' }
  ],
  '15': [
    { id: 'img-019', storyboardId: '15', url: '/uploads/storyboard/sb-015-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-015-img-01.jpg', prompt: 'romance drama, luxury office, man and woman signing contract', createdAt: '2024-06-07T10:00:00Z' },
    { id: 'img-020', storyboardId: '15', url: '/uploads/storyboard/sb-015-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-015-img-02.jpg', prompt: 'romance drama, close-up of hands holding pen, tension', createdAt: '2024-06-07T10:05:00Z' }
  ],
  '20': [
    { id: 'img-021', storyboardId: '20', url: '/uploads/storyboard/sb-020-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-020-img-01.jpg', prompt: 'xianxia style, young disciple bowing before sect elders', createdAt: '2024-05-12T09:00:00Z' },
    { id: 'img-022', storyboardId: '20', url: '/uploads/storyboard/sb-020-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-020-img-02.jpg', prompt: 'xianxia style, grand sect hall, floating swords', createdAt: '2024-05-12T09:05:00Z' }
  ],
  '29': [
    { id: 'img-023', storyboardId: '29', url: '/uploads/storyboard/sb-029-img-01.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-029-img-01.jpg', prompt: 'post-apocalyptic, city skyline crumbling, dust clouds', createdAt: '2024-03-18T14:00:00Z' },
    { id: 'img-024', storyboardId: '29', url: '/uploads/storyboard/sb-029-img-02.jpg', thumbnail: '/uploads/storyboard/thumbs/sb-029-img-02.jpg', prompt: 'post-apocalyptic, people running in panic, debris falling', createdAt: '2024-03-18T14:05:00Z' }
  ]
}

const storyboardAssets: Record<string, unknown[]> = {
  '1': [
    { id: 'sa-001', storyboardId: '1', assetId: '1', assetName: '主角头像', assetType: 'image', url: '' },
    { id: 'sa-002', storyboardId: '1', assetId: '2', assetName: '场景背景-山巅', assetType: 'image', url: '' }
  ],
  '3': [
    { id: 'sa-003', storyboardId: '3', assetId: '3', assetName: '场景背景-厨房', assetType: 'image', url: '' },
    { id: 'sa-004', storyboardId: '3', assetId: '4', assetName: 'BGM-紧张', assetType: 'audio', url: '' }
  ],
  '4': [
    { id: 'sa-005', storyboardId: '4', assetId: '5', assetName: '场景背景-御膳房对决', assetType: 'image', url: '' },
    { id: 'sa-006', storyboardId: '4', assetId: '6', assetName: 'BGM-激烈', assetType: 'audio', url: '' },
    { id: 'sa-007', storyboardId: '4', assetId: '7', assetName: '特效-火焰', assetType: 'vfx', url: '' }
  ],
  '9': [
    { id: 'sa-008', storyboardId: '9', assetId: '8', assetName: '特效-时空裂缝', assetType: 'vfx', url: '' },
    { id: 'sa-009', storyboardId: '9', assetId: '9', assetName: '场景背景-现代厨房', assetType: 'image', url: '' }
  ],
  '12': [
    { id: 'sa-010', storyboardId: '12', assetId: '10', assetName: '场景背景-金銮殿', assetType: 'image', url: '' },
    { id: 'sa-011', storyboardId: '12', assetId: '11', assetName: 'BGM-庄严', assetType: 'audio', url: '' }
  ],
  '15': [
    { id: 'sa-012', storyboardId: '15', assetId: '12', assetName: '场景背景-总裁办公室', assetType: 'image', url: '' },
    { id: 'sa-013', storyboardId: '15', assetId: '13', assetName: 'BGM-浪漫', assetType: 'audio', url: '' }
  ],
  '20': [
    { id: 'sa-014', storyboardId: '20', assetId: '14', assetName: '场景背景-青云山', assetType: 'image', url: '' },
    { id: 'sa-015', storyboardId: '20', assetId: '15', assetName: 'BGM-仙侠', assetType: 'audio', url: '' },
    { id: 'sa-016', storyboardId: '20', assetId: '16', assetName: '特效-仙光', assetType: 'vfx', url: '' }
  ],
  '29': [
    { id: 'sa-017', storyboardId: '29', assetId: '17', assetName: '场景背景-废墟城市', assetType: 'image', url: '' },
    { id: 'sa-018', storyboardId: '29', assetId: '18', assetName: 'BGM-末日', assetType: 'audio', url: '' },
    { id: 'sa-019', storyboardId: '29', assetId: '19', assetName: '特效-爆炸', assetType: 'vfx', url: '' }
  ]
}

const scenes = [
  { id: '1', name: '青丘山', description: '巍峨的仙山，云雾缭绕，山巅可俯瞰大地', episodeId: '1', projectId: '1' },
  { id: '2', name: '御膳房', description: '皇宫御膳房，金碧辉煌，灶具齐全', episodeId: '1', projectId: '1' },
  { id: '3', name: '竹林', description: '幽静的竹林，月光洒落，风吹竹叶沙沙作响', episodeId: '1', projectId: '1' },
  { id: '4', name: '现代厨房', description: '灯火通明的现代化厨房，不锈钢灶台，各式厨具齐全', episodeId: '1', projectId: '1' },
  { id: '5', name: '古代集市', description: '热闹非凡的古代集市，商贩叫卖，人来人往', episodeId: '2', projectId: '1' },
  { id: '6', name: '金銮殿', description: '庄严肃穆的金銮殿，龙椅高悬，文武百官分列两侧', episodeId: '4', projectId: '1' },
  { id: '7', name: '总裁办公室', description: '落地窗前的豪华总裁办公室，城市天际线尽收眼底', episodeId: '7', projectId: '2' },
  { id: '8', name: '城市街道', description: '繁华的城市街道，霓虹闪烁，车水马龙', episodeId: '7', projectId: '2' },
  { id: '9', name: '公寓客厅', description: '温馨的现代公寓客厅，落地窗配米色沙发', episodeId: '8', projectId: '2' },
  { id: '10', name: '公司天台', description: '公司大楼天台，可俯瞰整座城市，夕阳西下', episodeId: '9', projectId: '2' },
  { id: '11', name: '青云山', description: '仙气缭绕的青云山，古松苍翠，瀑布飞流', episodeId: '10', projectId: '3' },
  { id: '12', name: '魔界深渊', description: '黑暗幽深的魔界深渊，紫雾弥漫，诡异恐怖', episodeId: '12', projectId: '3' },
  { id: '13', name: '丹房', description: '仙门丹房，丹炉排列，灵气充沛，药香四溢', episodeId: '11', projectId: '3' },
  { id: '14', name: '城市夜景', description: '现代都市的璀璨夜景，高楼林立，霓虹闪烁', episodeId: '13', projectId: '4' },
  { id: '15', name: '地铁车厢', description: '拥挤的地铁车厢，乘客低头看手机，日常通勤', episodeId: '13', projectId: '4' },
  { id: '16', name: '温馨小屋', description: '温暖舒适的小公寓，阳光透过窗帘洒在木质地板上', episodeId: '14', projectId: '5' },
  { id: '17', name: '宠物公园', description: '绿草如茵的宠物公园，狗狗奔跑，猫咪晒太阳', episodeId: '14', projectId: '5' },
  { id: '18', name: '城市屋顶', description: '公寓楼顶，可俯瞰整条街道，烟囱和天线错落', episodeId: '15', projectId: '5' },
  { id: '19', name: '废墟城市', description: '末日后的城市废墟，断壁残垣，尘土飞扬', episodeId: '16', projectId: '6' },
  { id: '20', name: '地下避难所', description: '简陋的地下避难所，昏暗灯光下挤满了幸存者', episodeId: '17', projectId: '6' }
]

const assets = [
  { id: '1', name: '主角头像', assetType: 'image', category: 'character', url: '', tags: ['角色', '主角'], fileSize: 1024000, projectId: '1', createdAt: '2024-01-15T00:00:00Z' },
  { id: '2', name: '反派立绘', assetType: 'image', category: 'character', url: '', tags: ['角色', '反派'], fileSize: 980000, projectId: '1', createdAt: '2024-01-20T00:00:00Z' },
  { id: '3', name: '场景背景-厨房', assetType: 'image', category: 'scene', url: '', tags: ['场景', '室内'], fileSize: 2048000, projectId: '1', createdAt: '2024-02-01T00:00:00Z' },
  { id: '4', name: '场景背景-宫殿', assetType: 'image', category: 'scene', url: '', tags: ['场景', '室内'], fileSize: 2560000, projectId: '1', createdAt: '2024-02-05T00:00:00Z' },
  { id: '5', name: 'BGM-紧张', assetType: 'audio', category: 'audio', url: '', tags: ['音频', 'BGM'], fileSize: 3072000, projectId: '1', createdAt: '2024-02-10T00:00:00Z' },
  { id: '6', name: 'BGM-温馨', assetType: 'audio', category: 'audio', url: '', tags: ['音频', 'BGM'], fileSize: 2560000, projectId: '1', createdAt: '2024-02-15T00:00:00Z' },
  { id: '7', name: '特效-火焰', assetType: 'image', category: 'effect', url: '', tags: ['特效', '火焰'], fileSize: 512000, projectId: '1', createdAt: '2024-03-01T00:00:00Z' },
  { id: '8', name: '特效-烟雾', assetType: 'image', category: 'effect', url: '', tags: ['特效', '烟雾'], fileSize: 384000, projectId: '1', createdAt: '2024-03-05T00:00:00Z' },
  { id: '9', name: '旁白音频', assetType: 'audio', category: 'audio', url: '', tags: ['音频', '旁白'], fileSize: 4096000, projectId: '1', createdAt: '2024-03-10T00:00:00Z' },
  { id: '10', name: '片头动画', assetType: 'video', category: 'video', url: '', tags: ['视频', '片头'], fileSize: 10240000, projectId: '1', createdAt: '2024-03-15T00:00:00Z' },
  { id: '11', name: '片尾字幕', assetType: 'video', category: 'video', url: '', tags: ['视频', '片尾'], fileSize: 5120000, projectId: '1', createdAt: '2024-03-20T00:00:00Z' },
  { id: '12', name: '宣传海报', assetType: 'image', category: 'marketing', url: '', tags: ['营销', '海报'], fileSize: 1536000, projectId: '1', createdAt: '2024-04-01T00:00:00Z' }
]

const teamAssets = [
  { id: 't1', name: '团队共享素材-古风场景', assetType: 'image', category: 'scene', url: '', teamId: '1', tags: ['共享', '古风'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 't2', name: '团队共享素材-角色模板', assetType: 'image', category: 'character', url: '', teamId: '1', tags: ['共享', '模板'], createdAt: '2024-01-15T00:00:00Z' },
  { id: 't3', name: '团队共享BGM合集', assetType: 'audio', category: 'audio', url: '', teamId: '1', tags: ['共享', 'BGM'], createdAt: '2024-02-01T00:00:00Z' },
  { id: 't4', name: '团队音效库', assetType: 'audio', category: 'audio', url: '', teamId: '1', tags: ['共享', '音效'], createdAt: '2024-02-15T00:00:00Z' },
  { id: 't5', name: '通用转场特效', assetType: 'video', category: 'effect', url: '', teamId: '1', tags: ['共享', '转场'], createdAt: '2024-03-01T00:00:00Z' }
]

const characters = [
  { id: '1', name: '林小厨', code: 'CHAR-001', gender: 'male', age: 25, personality: '乐观开朗、机智幽默', positioning: '主角', appearance: '阳光帅气，常穿白色厨师服', background: '现代顶级厨师，意外穿越到古代', avatar: '', projectId: '1' },
  { id: '2', name: '御膳房总管', code: 'CHAR-002', gender: 'male', age: 50, personality: '严厉、正直', positioning: '配角', appearance: '威严中年，身着官服', background: '御膳房负责人，对厨艺要求极高', avatar: '', projectId: '1' },
  { id: '3', name: '小蝶', code: 'CHAR-003', gender: 'female', age: 22, personality: '温柔善良、善解人意', positioning: '女主角', appearance: '清秀少女，粉色侍女服', background: '御膳房侍女，暗中帮助林小厨', avatar: '', projectId: '1' },
  { id: '4', name: '皇帝', code: 'CHAR-004', gender: 'male', age: 45, personality: '威严霸气、爱好美食', positioning: '配角', appearance: '龙袍加身，气宇轩昂', background: '当朝皇帝，对美食有极高追求', avatar: '', projectId: '1' },
  { id: '5', name: '旁白', code: 'CHAR-005', gender: 'male', age: 35, personality: '沉稳睿智', positioning: '其他', appearance: '无固定形象', background: '故事旁白者', avatar: '', projectId: '1' }
]

const seedanceTasks = [
  { id: 'task-001', name: '古风美食短片-第1集', status: 'completed', progress: 100, style: '古风写实', resolution: '1920x1080', shots: 8, priority: 'high', submitTime: '2024-03-01T10:00:00Z', estimatedTime: '2024-03-01T10:30:00Z', remark: '第一集已完成渲染' },
  { id: 'task-002', name: '古风美食短片-第2集', status: 'running', progress: 65, style: '古风写实', resolution: '1920x1080', shots: 10, priority: 'high', submitTime: '2024-03-02T14:00:00Z', estimatedTime: '2024-03-02T14:45:00Z', remark: '正在生成第7个镜头' },
  { id: 'task-003', name: '角色宣传视频-林小厨', status: 'queued', progress: 0, style: '卡通渲染', resolution: '1280x720', shots: 5, priority: 'normal', submitTime: '2024-03-03T09:00:00Z', estimatedTime: '2024-03-03T09:20:00Z', remark: '排队等待中' },
  { id: 'task-004', name: '场景预览-御膳房', status: 'failed', progress: 30, style: '古风写实', resolution: '1920x1080', shots: 3, priority: 'low', submitTime: '2024-03-03T11:00:00Z', estimatedTime: '', remark: '渲染引擎超时，请重试' },
  { id: 'task-005', name: '片尾字幕动画', status: 'completed', progress: 100, style: '简约现代', resolution: '1920x1080', shots: 2, priority: 'normal', submitTime: '2024-02-28T16:00:00Z', estimatedTime: '2024-02-28T16:10:00Z', remark: '已完成' }
]

export default [
// ==================== 统计/仪表盘 ====================
  {
    url: '/api/statistics/dashboard',
    method: 'get',
    response: () =>
      successResponse({
        totalProjects: 24,
        activeProjects: 16,
        totalVideos: 128,
        totalStoryboards: 356,
        totalAssets: 892,
        creditsBalance: 68000,
        pendingReviews: 12,
        pendingReviewsChange: '+18%',
        projectProgress: 76,
        projectProgressChange: '+5%',
        ownedProjects: 8,
        ownedProjectsChange: '+2',
        creditsBalanceChange: '-12%',
        activeUsers: {
          values: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 260, 280],
          labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        totalUsers: '1,286',
        totalVisits: '38,542',
        dailyVisits: '1,024',
        weeklyChange: '+23%'
      })
  },
  {
    url: '/api/statistics/realtime',
    method: 'get',
    response: () =>
      successResponse({
        activeUsers: 56,
        runningTasks: 8,
        todayVideos: 12,
        todayAssets: 34,
        activities: [
          { username: '张编剧', action: '提交了剧本', target: '《重生厨神》第三集' },
          { username: '李导演', action: '审核通过了', target: '分镜 SB-015' },
          { username: '王美术', action: '上传了素材', target: '角色立绘-林小厨' },
          { username: '赵制片', action: '创建了项目', target: '《仙侠奇缘》' },
          { username: '刘剪辑', action: '完成了剪辑', target: '预告片V2' },
          { username: '陈运营', action: '发布了视频', target: '宣传MV-花絮' },
          { username: '周编剧', action: '提交了剧本', target: '《甜妻》第五集' },
          { username: '吴美术', action: '更新了分镜', target: '场景-皇宫大殿' },
          { username: '孙导演', action: '驳回了素材', target: '背景-竹林' },
          { username: '钱制片', action: '分配了任务', target: 'AI生成角色图' }
        ]
      })
  },
  {
    url: '/api/statistics/trends',
    method: 'get',
    response: () =>
      successResponse({
        values: [820, 932, 901, 1034, 1290, 1330, 1320, 1450, 1520, 1680, 1820, 1950],
        labels: ['05-01', '05-03', '05-05', '05-07', '05-09', '05-11', '05-13', '05-15', '05-17', '05-19', '05-21', '05-23']
      })
  },
  {
    url: '/api/statistics/credits',
    method: 'get',
    response: () =>
      successResponse({
        balance: 68000,
        totalEarned: 100000,
        totalSpent: 32000,
        recentTransactions: [
          { date: '2024-06-15', amount: -500, type: 'spend' },
          { date: '2024-06-14', amount: -300, type: 'spend' },
          { date: '2024-06-10', amount: 10000, type: 'earn' },
          { date: '2024-06-08', amount: -800, type: 'spend' }
        ]
      })
  },
  {
    url: '/api/statistics/alerts',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', type: 'credit', level: 'warning', message: '积分余额不足10000，请及时充值', createTime: '2024-06-15T10:00:00Z' },
        { id: '2', type: 'storage', level: 'info', message: '存储空间已使用75%', createTime: '2024-06-14T08:00:00Z' },
        { id: '3', type: 'task', level: 'error', message: '视频生成任务 VG-089 失败', createTime: '2024-06-13T15:30:00Z' }
      ])
  },
  {
    url: '/api/statistics/teams/ranking',
    method: 'get',
    response: () =>
      successResponse([
        { teamId: '1', teamName: '创意工作室', score: 95, rank: 1, projectCount: 12, videoCount: 45 },
        { teamId: '2', teamName: '影视制作部', score: 88, rank: 2, projectCount: 8, videoCount: 32 },
        { teamId: '3', teamName: '动画团队', score: 82, rank: 3, projectCount: 6, videoCount: 28 }
      ])
  },
  {
    url: '/api/statistics/projects/analysis',
    method: 'get',
    response: () =>
      successResponse([
        { name: '《重生之我在古代当厨神》', videoCount: 18, duration: 45, completionRate: 68, aiUsage: 156, trend: '+12%' },
        { name: '《总裁的契约甜妻》', videoCount: 12, duration: 30, completionRate: 45, aiUsage: 89, trend: '+8%' },
        { name: '《仙侠奇缘录》', videoCount: 24, duration: 60, completionRate: 100, aiUsage: 234, trend: '+15%' },
        { name: '《都市修仙传》', videoCount: 6, duration: 15, completionRate: 32, aiUsage: 67, trend: '-3%' },
        { name: '《萌宠大作战》', videoCount: 15, duration: 38, completionRate: 82, aiUsage: 198, trend: '+10%' },
        { name: '《末日求生日记》', videoCount: 20, duration: 50, completionRate: 100, aiUsage: 345, trend: '+5%' }
      ])
  },
  {
    url: '/api/statistics/users/activity-rank',
    method: 'get',
    response: () =>
      successResponse([
        { name: '张制片', avatar: '', department: '制作部', loginCount: 45, operationCount: 230, outputVideos: 18, outputDuration: 45, activityScore: 95 },
        { name: '李导演', avatar: '', department: '导演部', loginCount: 38, operationCount: 185, outputVideos: 15, outputDuration: 38, activityScore: 88 },
        { name: '王编剧', avatar: '', department: '编剧部', loginCount: 52, operationCount: 310, outputVideos: 22, outputDuration: 55, activityScore: 92 },
        { name: '赵剪辑', avatar: '', department: '后期部', loginCount: 30, operationCount: 145, outputVideos: 12, outputDuration: 30, activityScore: 78 },
        { name: '孙导演', avatar: '', department: '导演部', loginCount: 28, operationCount: 120, outputVideos: 10, outputDuration: 25, activityScore: 72 },
        { name: '刘美术', avatar: '', department: '美术部', loginCount: 35, operationCount: 200, outputVideos: 14, outputDuration: 35, activityScore: 85 },
        { name: '周编剧', avatar: '', department: '编剧部', loginCount: 42, operationCount: 260, outputVideos: 20, outputDuration: 50, activityScore: 90 },
        { name: '吴美术', avatar: '', department: '美术部', loginCount: 25, operationCount: 110, outputVideos: 8, outputDuration: 20, activityScore: 68 }
      ])
  },
  {
    url: '/api/statistics/teams/:teamId/workload',
    method: 'get',
    response: () =>
      successResponse({
        teamId: '1',
        teamName: '创意工作室',
        totalTasks: 156,
        completedTasks: 120,
        members: [
          { userId: '1', userName: '张制片', taskCount: 32, completedCount: 28, avgTime: '2.5天' },
          { userId: '2', userName: '李导演', taskCount: 28, completedCount: 22, avgTime: '3.1天' },
          { userId: '3', userName: '王编剧', taskCount: 35, completedCount: 30, avgTime: '2.0天' },
          { userId: '4', userName: '刘美术', taskCount: 25, completedCount: 20, avgTime: '2.8天' },
          { userId: '5', userName: '赵剪辑', taskCount: 36, completedCount: 20, avgTime: '3.5天' }
        ]
      })
  },
  {
    url: '/api/statistics/teams/:teamId/users/contribution',
    method: 'get',
    response: () =>
      successResponse([
        { userId: '3', userName: '王编剧', commitCount: 45, reviewCount: 30, score: 92 },
        { userId: '1', userName: '张制片', commitCount: 38, reviewCount: 25, score: 88 },
        { userId: '2', userName: '李导演', commitCount: 32, reviewCount: 40, score: 85 },
        { userId: '5', userName: '赵剪辑', commitCount: 28, reviewCount: 15, score: 78 },
        { userId: '4', userName: '刘美术', commitCount: 25, reviewCount: 10, score: 72 }
      ])
  },
  {
    url: '/api/statistics/teams/:teamId/users/activity',
    method: 'get',
    response: () =>
      successResponse([
        { date: '2024-06-15', activeHours: 8.5, taskCount: 12 },
        { date: '2024-06-14', activeHours: 7.2, taskCount: 10 },
        { date: '2024-06-13', activeHours: 9.0, taskCount: 15 },
        { date: '2024-06-12', activeHours: 6.5, taskCount: 8 },
        { date: '2024-06-11', activeHours: 8.0, taskCount: 11 },
        { date: '2024-06-10', activeHours: 7.8, taskCount: 9 },
        { date: '2024-06-09', activeHours: 5.5, taskCount: 6 }
      ])
  },
  {
    url: '/api/statistics/teams/:teamId/projects/completion',
    method: 'get',
    response: () =>
      successResponse({
        totalProjects: 12,
        completedProjects: 5,
        inProgressProjects: 6,
        pausedProjects: 1,
        projects: [
          { projectId: '1', name: '《重生之我在古代当厨神》', progress: 68, status: 'progress' },
          { projectId: '2', name: '《总裁的契约甜妻》', progress: 45, status: 'progress' },
          { projectId: '3', name: '《仙侠奇缘录》', progress: 100, status: 'completed' },
          { projectId: '5', name: '《萌宠大作战》', progress: 82, status: 'progress' }
        ]
      })
  },
  {
    url: '/api/statistics/teams/:teamId/reports/scheduled',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '周报-项目进度', frequency: 'weekly', recipients: ['张制片', '李导演'], lastRun: '2024-06-14T09:00:00Z', nextRun: '2024-06-21T09:00:00Z', status: 'active' },
        { id: '2', name: '月报-资源消耗', frequency: 'monthly', recipients: ['张制片'], lastRun: '2024-06-01T09:00:00Z', nextRun: '2024-07-01T09:00:00Z', status: 'active' }
      ])
  },
  {
    url: '/api/statistics/teams/:teamId/reports/scheduled',
    method: 'post',
    response: () =>
      successResponse({ id: '3', name: '新报表', frequency: 'daily', status: 'active', createdAt: new Date().toISOString() })
  },
  {
    url: '/api/statistics/teams/:teamId/reports/scheduled/:id',
    method: 'put',
    response: () => successResponse(null, '更新成功')
  },
  {
    url: '/api/statistics/teams/:teamId/reports/scheduled/:id',
    method: 'delete',
    response: () => successResponse(null, '删除成功')
  },
  {
    url: '/api/statistics/teams/:teamId/reports/custom',
    method: 'post',
    response: () =>
      successResponse({
        id: 'custom-001',
        name: '自定义报表',
        generatedAt: new Date().toISOString(),
        data: { totalItems: 156, summary: '报表生成成功' }
      })
  },
  {
    url: '/api/statistics/teams/:teamId/export',
    method: 'post',
    response: () => successResponse({ exportId: 'export-001', status: 'processing' })
  },
  {
    url: '/api/statistics/projects/:projectId/videos',
    method: 'get',
    response: () =>
      successResponse({
        totalVideos: 45,
        completedVideos: 32,
        processingVideos: 8,
        failedVideos: 5,
        monthlyData: [
          { month: '2024-01', count: 5 },
          { month: '2024-02', count: 8 },
          { month: '2024-03', count: 6 },
          { month: '2024-04', count: 10 },
          { month: '2024-05', count: 9 },
          { month: '2024-06', count: 7 }
        ]
      })
  },
  {
    url: '/api/statistics/projects/:projectId/usage',
    method: 'get',
    response: () =>
      successResponse({
        storageUsed: 2.5,
        storageTotal: 10,
        storageUnit: 'GB',
        aiCreditsUsed: 15000,
        aiCreditsTotal: 50000,
        bandwidthUsed: 12.8,
        bandwidthTotal: 50,
        bandwidthUnit: 'GB'
      })
  },
  {
    url: '/api/statistics/projects/:projectId/usage/detail',
    method: 'get',
    response: () =>
      paginatedResponse([
        { date: '2024-06-15', type: 'image_generation', credits: 500, count: 10 },
        { date: '2024-06-14', type: 'video_generation', credits: 2000, count: 2 },
        { date: '2024-06-13', type: 'script_analysis', credits: 300, count: 5 },
        { date: '2024-06-12', type: 'storyboard_decompose', credits: 800, count: 3 },
        { date: '2024-06-11', type: 'image_generation', credits: 600, count: 12 }
      ], 5)
  },
  {
    url: '/api/statistics/projects/:projectId/storyboards',
    method: 'get',
    response: () =>
      successResponse({
        totalStoryboards: 24,
        byStatus: { completed: 15, designing: 5, pending: 4 },
        bySceneType: { indoor: 10, outdoor: 8, mixed: 6 },
        averageDuration: 18.5,
        totalDuration: 444
      })
  },
  {
    url: '/api/statistics/projects/:projectId/resources',
    method: 'get',
    response: () =>
      successResponse({
        cpu: { used: 45, total: 100, unit: '%' },
        memory: { used: 6.2, total: 16, unit: 'GB' },
        storage: { used: 2.5, total: 10, unit: 'GB' },
        gpu: { used: 30, total: 100, unit: '%' }
      })
  },
  {
    url: '/api/statistics/projects/:projectId/ai-usage',
    method: 'get',
    response: () =>
      successResponse({
        totalCalls: 1520,
        byModel: [
          { model: 'gpt-4', calls: 520, tokens: 1250000 },
          { model: 'dall-e-3', calls: 380, tokens: 0 },
          { model: 'seedance-1.0', calls: 420, tokens: 0 },
          { model: 'stable-diffusion', calls: 200, tokens: 0 }
        ],
        dailyTrend: [
          { date: '2024-06-09', calls: 180 },
          { date: '2024-06-10', calls: 220 },
          { date: '2024-06-11', calls: 195 },
          { date: '2024-06-12', calls: 240 },
          { date: '2024-06-13', calls: 210 },
          { date: '2024-06-14', calls: 235 },
          { date: '2024-06-15', calls: 240 }
        ]
      })
  },
// ========== 1. GET /api/projects - 项目列表 ==========
  {
    url: '/api/projects',
    method: 'get',
    response: () => paginatedResponse(projects, 6)
  },

  // ========== 2. POST /api/projects - 创建项目 ==========
  {
    url: '/api/projects',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: '99',
        ...body,
        status: 'progress',
        progress: 0,
        memberCount: 1,
        assetCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
  },

  // ========== 3. GET /api/projects/:id - 项目详情 ==========
  {
    url: '/api/projects/:id',
    method: 'get',
    response: () => successResponse(projectDetail)
  },

  // ========== 4. PUT /api/projects/:id - 更新项目 ==========
  {
    url: '/api/projects/:id',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '1', ...body, updatedAt: new Date().toISOString() })
  },

  // ========== 5. DELETE /api/projects/:id - 删除项目 ==========
  {
    url: '/api/projects/:id',
    method: 'delete',
    response: () => successResponse(null, '项目已删除')
  },

  // ========== 6. POST /api/projects/:id/restore - 恢复项目 ==========
  {
    url: '/api/projects/:id/restore',
    method: 'post',
    response: () => successResponse(null, '项目已恢复')
  },

  // ========== 7. POST /api/projects/:id/archive - 归档项目 ==========
  {
    url: '/api/projects/:id/archive',
    method: 'post',
    response: () => successResponse(null, '项目已归档')
  },

  // ========== 8. POST /api/projects/:id/unarchive - 取消归档 ==========
  {
    url: '/api/projects/:id/unarchive',
    method: 'post',
    response: () => successResponse(null, '已取消归档')
  },

  // ========== 9. PUT /api/projects/:id/status - 更新项目状态 ==========
  {
    url: '/api/projects/:id/status',
    method: 'put',
    response: () => successResponse(null, '状态已更新')
  },

  // ========== 10. POST /api/projects/:id/copy - 复制项目 ==========
  {
    url: '/api/projects/:id/copy',
    method: 'post',
    response: () =>
      successResponse({
        id: '100',
        name: '《重生之我在古代当厨神》副本',
        projectName: '《重生之我在古代当厨神》副本',
        description: '现代厨师林小厨意外穿越到古代，凭借精湛厨艺征服宫廷，一路逆袭成为御膳房总厨的爆笑美食短剧。',
        type: 'animation',
        status: 'progress',
        progress: 0,
        coverImage: '/uploads/covers/project-01-cover.jpg',
        cover: '/uploads/covers/project-01-cover.jpg',
        ownerName: '张制片',
        memberCount: 1,
        assetCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, '项目已复制')
  },

  // ========== 11. POST /api/projects/:id/cover - 上传封面 ==========
  {
    url: '/api/projects/:id/cover',
    method: 'post',
    response: () =>
      successResponse({
        coverImage: '/uploads/covers/project-01-cover-new.jpg',
        cover: '/uploads/covers/project-01-cover-new.jpg'
      }, '封面已更新')
  },

  // ========== 12. GET /api/projects/:id/members - 项目成员列表 ==========
  {
    url: '/api/projects/:id/members',
    method: 'get',
    response: () => paginatedResponse(members, 5)
  },

  // ========== 13. POST /api/projects/:id/members - 添加成员 ==========
  {
    url: '/api/projects/:id/members',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: '6',
        userId: '6',
        userName: (body as Record<string, unknown>).userName || '新成员',
        avatar: '',
        role: (body as Record<string, unknown>).role || 'viewer',
        joinTime: new Date().toISOString()
      }, '成员已添加')
  },

  // ========== 14. PUT /api/projects/:id/members/role - 更新成员角色 ==========
  {
    url: '/api/projects/:id/members/role',
    method: 'put',
    response: () => successResponse(null, '角色已更新')
  },

  // ========== 15. DELETE /api/projects/:id/members/:memberId - 移除成员 ==========
  {
    url: '/api/projects/:id/members/:memberId',
    method: 'delete',
    response: () => successResponse(null, '成员已移除')
  },

  // ========== 16. GET /api/projects/:id/config - 项目配置 ==========
  {
    url: '/api/projects/:id/config',
    method: 'get',
    response: () =>
      successResponse({
        artStyle: 'anime',
        colorTone: 'warm',
        characterStyle: 'cute',
        sceneStyle: 'detailed',
        resolution: '1920x1080',
        frameRate: 24,
        language: 'zh-CN',
        aspectRatio: '16:9',
        outputFormat: 'mp4',
        quality: 'high',
        enableSubtitles: true,
        subtitleLanguage: 'zh-CN',
        enableWatermark: false,
        watermarkText: '',
        defaultTransition: 'fade',
        defaultShotDuration: 5,
        musicVolume: 0.6,
        sfxVolume: 0.8,
        voiceVolume: 1.0
      })
  },

  // ========== 17. PUT /api/projects/:id/config - 更新项目配置 ==========
  {
    url: '/api/projects/:id/config',
    method: 'put',
    response: () => successResponse(null, '配置已更新')
  },

  // ========== 18. GET /api/projects/:id/review-config - 审核配置 ==========
  {
    url: '/api/projects/:id/review-config',
    method: 'get',
    response: () =>
      successResponse({
        enabled: true,
        autoReview: false,
        reviewers: ['李导演', '张制片'],
        requireApproval: true,
        minApprovalCount: 1,
        reviewStages: ['script', 'storyboard', 'video'],
        notifyOnSubmit: true,
        notifyOnDecision: true,
        autoRejectKeywords: ['暴力', '血腥', '政治敏感'],
        maxRevisionCount: 3
      })
  },

  // ========== 19. PUT /api/projects/:id/review-config - 更新审核配置 ==========
  {
    url: '/api/projects/:id/review-config',
    method: 'put',
    response: () => successResponse(null, '审核配置已更新')
  },

  // ========== 20. GET /api/projects/:id/statistics - 项目统计 ==========
  {
    url: '/api/projects/:id/statistics',
    method: 'get',
    response: () =>
      successResponse({
        totalScripts: 2,
        totalEpisodes: 3,
        totalStoryboards: 24,
        totalAssets: 156,
        totalMembers: 5,
        totalWordCount: 10100,
        totalDuration: 45,
        completedScripts: 2,
        completedEpisodes: 2,
        completedStoryboards: 18,
        pendingReview: 3,
        averageScriptWordCount: 3367,
        lastActivityTime: '2024-06-15T08:30:00Z',
        creationDate: '2024-01-01T00:00:00Z',
        daysSinceCreation: 166,
        dailyProgress: [
          { date: '2024-06-09', progress: 62 },
          { date: '2024-06-10', progress: 63 },
          { date: '2024-06-11', progress: 65 },
          { date: '2024-06-12', progress: 65 },
          { date: '2024-06-13', progress: 66 },
          { date: '2024-06-14', progress: 67 },
          { date: '2024-06-15', progress: 68 }
        ]
      })
  },

  // ========== 21. GET /api/projects/:id/episodes - 分集列表 ==========
  {
    url: '/api/projects/:id/episodes',
    method: 'get',
    response: () => successResponse(episodes)
  },

  // ========== 22. POST /api/projects/:id/episodes - 创建分集 ==========
  {
    url: '/api/projects/:id/episodes',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: '99',
        ...body,
        projectId: '1',
        status: 'draft',
        wordCount: 0,
        duration: 0,
        createdAt: new Date().toISOString()
      }, '分集已创建')
  },

  // ========== 23. GET /api/projects/:id/scripts - 剧本列表 ==========
  {
    url: '/api/projects/:id/scripts',
    method: 'get',
    response: () => paginatedResponse(scripts, scripts.length)
  },

  // ========== 24. POST /api/projects/:id/scripts - 创建剧本 ==========
  {
    url: '/api/projects/:id/scripts',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: '99',
        ...body,
        status: 'draft',
        wordCount: 0,
        duration: 0,
        projectId: '1',
        createdAt: new Date().toISOString()
      }, '剧本已创建')
  },

  // ========== 25. GET /api/scripts/:id - 剧本详情 ==========
  {
    url: '/api/scripts/:id',
    method: 'get',
    response: () =>
      successResponse({
        id: '1',
        name: '《重生之我在古代当厨神》第一集',
        code: 'SCRIPT-001',
        status: 'completed',
        wordCount: 4200,
        duration: 15,
        author: '王编剧',
        updateTime: '2024-06-15',
        projectId: '1',
        content: scriptDetailContent
      })
  },

  // ========== 26. PUT /api/scripts/:id - 更新剧本 ==========
  {
    url: '/api/scripts/:id',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '1', ...body, updateTime: new Date().toISOString() }, '剧本已更新')
  },

  // ========== 27. DELETE /api/scripts/:id - 删除剧本 ==========
  {
    url: '/api/scripts/:id',
    method: 'delete',
    response: () => successResponse(null, '剧本已删除')
  },

  // ========== 28. GET /api/projects/:id/scripts/:scriptId/episodes - 剧本分集 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/episodes',
    method: 'get',
    response: () =>
      successResponse(episodes.filter(e => e.projectId === '1'))
  },

  // ========== 29. GET /api/scripts/:id/episodes/:episodeId - 分集详情 ==========
  {
    url: '/api/scripts/:id/episodes/:episodeId',
    method: 'get',
    response: () =>
      successResponse({
        id: '1',
        episodeNumber: 1,
        number: 1,
        name: '穿越了？我是厨神？',
        status: 'completed',
        wordCount: 4200,
        duration: 15,
        author: '王编剧',
        updateTime: '2024-06-15',
        content: scriptDetailContent
      })
  },

  // ========== 30. PUT /api/scripts/:id/episodes/:episodeId - 更新分集 ==========
  {
    url: '/api/scripts/:id/episodes/:episodeId',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '1', ...body, updateTime: new Date().toISOString() }, '分集已更新')
  },

  // ========== 31. DELETE /api/scripts/:id/episodes/:episodeId - 删除分集 ==========
  {
    url: '/api/scripts/:id/episodes/:episodeId',
    method: 'delete',
    response: () => successResponse(null, '分集已删除')
  },

  // ========== 32. POST /api/projects/:id/scripts/:scriptId/decompose - 拆解剧本 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/decompose',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-decompose-001',
        status: 'processing',
        message: '剧本拆解任务已提交，预计3分钟完成'
      })
  },

  // ========== 33. POST /api/projects/:id/scripts/:scriptId/character-profiles - 生成人物小传 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/character-profiles',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-profiles-001',
        status: 'processing',
        message: '人物小传生成任务已提交，预计5分钟完成'
      })
  },

  // ========== 34. GET /api/scripts/:id/character-profiles - 人物小传 ==========
  {
    url: '/api/scripts/:id/character-profiles',
    method: 'get',
    response: () =>
      successResponse([
        {
          id: '1',
          name: '林小厨',
          code: 'CHAR-001',
          gender: 'male',
          age: 25,
          personality: '乐观开朗、机智幽默、热爱美食、永不言弃',
          positioning: '男主角',
          appearance: '身材修长，五官端正，一双灵动的眼睛透着聪明劲儿。常穿白色厨师服，腰间系着蓝色围裙，头戴高高的厨师帽。穿越后换上古代布衣，但始终随身携带一把祖传菜刀。',
          background: '现代顶级厨师，师从法国米其林三星大厨，精通中西料理。性格洒脱不羁，对美食有着近乎偏执的追求。一次意外穿越到古代，凭借现代厨艺知识在御膳房闯出一片天地。',
          voiceDescription: '年轻男声，语速偏快，充满活力，偶尔冒出几句现代网络用语',
          skills: ['刀工精湛', '火候掌控', '调味大师', '创新菜品'],
          relationships: ['御膳房总管（师徒/亦敌亦友）', '小翠（青梅竹马/暗恋对象）']
        },
        {
          id: '2',
          name: '御膳房总管',
          code: 'CHAR-002',
          gender: 'male',
          age: 50,
          personality: '严厉苛刻、正直无私、外冷内热、深藏不露',
          positioning: '重要配角',
          appearance: '身材魁梧，面容威严，两鬓斑白但精神矍铄。身着深蓝色官服，腰佩玉带，举手投足间尽显皇家气度。双手布满老茧，是多年掌勺留下的印记。',
          background: '御膳房总管太监，伺候过三代皇帝，厨艺冠绝天下。表面上对林小厨百般刁难，实则是在磨砺他的心性。年轻时也曾是意气风发的厨师，因宫廷斗争被迫净身入宫，将所有心血倾注在厨艺之上。',
          voiceDescription: '中年男声，低沉浑厚，说话慢条斯理，偶尔尖细（太监特征）',
          skills: ['宫廷菜正宗传人', '食材鉴别', '食疗养生', '宫廷礼仪'],
          relationships: ['林小厨（下属/暗中器重）', '皇帝（主仆/忠心耿耿）']
        }
      ])
  },

  // ========== 35. POST /api/projects/:id/scripts/:scriptId/extract-assets - 提取资产 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/extract-assets',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-extract-001',
        status: 'processing',
        message: '资产提取任务已提交，预计8分钟完成'
      })
  },

  // ========== 36. GET /api/scripts/:id/extracted-assets - 已提取资产 ==========
  {
    url: '/api/scripts/:id/extracted-assets',
    method: 'get',
    response: () =>
      successResponse({
        characters: [
          { id: 'ext-char-001', name: '林小厨', type: 'character', description: '穿越厨师，穿古代布衣，腰挂菜刀', imageUrl: '/uploads/assets/char-linxiaochu.jpg', status: 'generated' },
          { id: 'ext-char-002', name: '御膳房总管', type: 'character', description: '威严中年太监，深蓝官服', imageUrl: '/uploads/assets/char-zongguan.jpg', status: 'generated' },
          { id: 'ext-char-003', name: '小翠', type: 'character', description: '清秀少女，粉色侍女服，双丫髻', imageUrl: '/uploads/assets/char-xiaocui.jpg', status: 'pending' }
        ],
        scenes: [
          { id: 'ext-scene-001', name: '现代厨房', type: 'scene', description: '灯火通明的现代化厨房，不锈钢灶台，各式厨具', imageUrl: '/uploads/assets/scene-modern-kitchen.jpg', status: 'generated' },
          { id: 'ext-scene-002', name: '御膳房', type: 'scene', description: '宏伟的皇家御膳房，红漆木柱，铜制灶具，蒸汽缭绕', imageUrl: '/uploads/assets/scene-imperial-kitchen.jpg', status: 'generated' },
          { id: 'ext-scene-003', name: '山间小路', type: 'scene', description: '青石铺就的山间小路，两侧翠竹掩映', imageUrl: '/uploads/assets/scene-mountain-path.jpg', status: 'pending' }
        ],
        props: [
          { id: 'ext-prop-001', name: '祖传菜刀', type: 'prop', description: '一把古朴的菜刀，刀身刻有花纹，寒光闪闪', imageUrl: '/uploads/assets/prop-cleaver.jpg', status: 'generated' },
          { id: 'ext-prop-002', name: '松茸炖鸡砂锅', type: 'prop', description: '精致的陶瓷砂锅，内盛金黄色松茸炖鸡', imageUrl: '/uploads/assets/prop-casserole.jpg', status: 'generated' }
        ],
        costumes: [
          { id: 'ext-costume-001', name: '白色厨师服', type: 'costume', description: '洁白的现代厨师服，配蓝色围裙和高帽', imageUrl: '/uploads/assets/costume-chef.jpg', status: 'generated' },
          { id: 'ext-costume-002', name: '古代布衣', type: 'costume', description: '素色麻布衣裳，腰系布带，朴素简洁', imageUrl: '/uploads/assets/costume-ancient.jpg', status: 'generated' }
        ]
      })
  },

  // ========== 37. POST /api/projects/:id/scripts/:scriptId/style-config - 生成风格配置 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/style-config',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-style-001',
        status: 'processing',
        message: '风格配置生成任务已提交，预计2分钟完成'
      })
  },

  // ========== 38. GET /api/scripts/:id/style-config - 风格配置 ==========
  {
    url: '/api/scripts/:id/style-config',
    method: 'get',
    response: () =>
      successResponse({
        artStyle: 'anime',
        colorTone: 'warm',
        characterStyle: 'cute',
        sceneStyle: 'detailed',
        lightingStyle: 'soft',
        textureStyle: 'smooth',
        lineWeight: 'medium',
        saturationLevel: 'high',
        contrastLevel: 'medium',
        referencePrompt: '日系动漫风格，色调温暖明亮，角色设计Q萌可爱，场景细节丰富，光影柔和，适合美食题材的温馨氛围',
        negativePrompt: '写实风格、阴暗色调、恐怖元素、血腥暴力',
        modelPreference: 'anime-v2',
        seedValue: 42
      })
  },

  // ========== 39. POST /api/projects/:id/scripts/:scriptId/ref-analysis - 参考图分析 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/ref-analysis',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-ref-001',
        status: 'processing',
        message: '参考图分析任务已提交，预计3分钟完成'
      })
  },

  // ========== 40. GET /api/scripts/:id/ref-analysis - 参考图分析结果 ==========
  {
    url: '/api/scripts/:id/ref-analysis',
    method: 'get',
    response: () =>
      successResponse({
        status: 'completed',
        analyzedAt: '2024-06-15T10:30:00Z',
        result: {
          dominantColors: ['#FF8C42', '#FFD166', '#06D6A0', '#118AB2'],
          styleKeywords: ['anime', 'warm', 'detailed', 'food', 'cozy'],
          moodDescription: '温馨治愈的美食动漫风格，色彩明亮饱和，光影柔和，给人以温暖愉悦的观感',
          recommendedSettings: {
            artStyle: 'anime',
            colorTone: 'warm',
            saturation: 0.8,
            contrast: 0.6,
            brightness: 0.7
          },
          similarReferences: [
            { id: 'ref-001', similarity: 0.92, url: '/uploads/references/ref-similar-01.jpg' },
            { id: 'ref-002', similarity: 0.87, url: '/uploads/references/ref-similar-02.jpg' }
          ]
        }
      })
  },

  // ========== 41. POST /api/projects/:id/scripts/:scriptId/review-content - 审核内容 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/review-content',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-review-001',
        status: 'processing',
        message: '内容审核任务已提交，预计1分钟完成'
      })
  },

  // ========== 42. GET /api/scripts/:id/review-status - 审核状态 ==========
  {
    url: '/api/scripts/:id/review-status',
    method: 'get',
    response: () =>
      successResponse({
        status: 'approved',
        violations: [],
        checkedAt: '2024-06-15T11:00:00Z',
        reviewer: '李导演',
        reviewNote: '剧本内容健康积极，美食描写生动有趣，通过审核。'
      })
  },

  // ========== 43. POST /api/scripts/:id/submit-review - 提交审核 ==========
  {
    url: '/api/scripts/:id/submit-review',
    method: 'post',
    response: () => successResponse(null, '已提交审核，请等待审核结果')
  },

  // ========== 44. POST /api/scripts/:id/withdraw-review - 撤回审核 ==========
  {
    url: '/api/scripts/:id/withdraw-review',
    method: 'post',
    response: () => successResponse(null, '已撤回审核申请')
  },

  // ========== 45. POST /api/projects/:id/scripts/:scriptId/voice-prompts - 生成音色提示词 ==========
  {
    url: '/api/projects/:id/scripts/:scriptId/voice-prompts',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-voice-001',
        status: 'processing',
        message: '音色提示词生成任务已提交，预计2分钟完成'
      })
  },

  // ========== 46. GET /api/scripts/:id/voice-prompts - 音色提示词 ==========
  {
    url: '/api/scripts/:id/voice-prompts',
    method: 'get',
    response: () =>
      successResponse({
        status: 'completed',
        generatedAt: '2024-06-15T12:00:00Z',
        prompts: [
          {
            characterId: '1',
            characterName: '林小厨',
            voicePrompt: '年轻男性声音，年龄约25岁，语速偏快且富有活力，音色清亮阳光，带有自信和幽默感。说话时偶尔会冒出一些现代网络用语，语调起伏较大，情绪表达丰富。适合热血少年、搞笑角色的配音风格。',
            recommendedVoiceId: 'voice-young-male-01',
            pitch: 'medium-high',
            speed: 1.1,
            emotion: 'cheerful'
          },
          {
            characterId: '2',
            characterName: '御膳房总管',
            voicePrompt: '中年男性声音，年龄约50岁，语速缓慢且沉稳，音色低沉浑厚带有一丝尖细（太监特征）。说话时语气威严，字正腔圆，偶尔流露出慈祥和关怀。适合宫廷剧中严肃长辈角色的配音风格。',
            recommendedVoiceId: 'voice-middle-male-01',
            pitch: 'low',
            speed: 0.8,
            emotion: 'stern'
          },
          {
            characterId: '3',
            characterName: '小翠',
            voicePrompt: '年轻女性声音，年龄约18岁，语速适中，音色甜美清脆，带有少女的天真和羞涩。说话时语调轻快，笑声如银铃般悦耳。适合古装剧中可爱侍女角色的配音风格。',
            recommendedVoiceId: 'voice-young-female-01',
            pitch: 'high',
            speed: 1.0,
            emotion: 'gentle'
          }
        ]
      })
  },

  // ========== 47. GET /api/scripts/:id/post-approval-status - 审批后状态 ==========
  {
    url: '/api/scripts/:id/post-approval-status',
    method: 'get',
    response: () =>
      successResponse({
        status: 'completed',
        progress: 100,
        completedAt: '2024-06-15T14:00:00Z',
        stages: {
          scriptReview: { status: 'completed', completedAt: '2024-06-15T11:00:00Z' },
          characterProfiles: { status: 'completed', completedAt: '2024-06-15T11:30:00Z' },
          assetExtraction: { status: 'completed', completedAt: '2024-06-15T12:00:00Z' },
          styleConfig: { status: 'completed', completedAt: '2024-06-15T12:30:00Z' },
          voicePrompts: { status: 'completed', completedAt: '2024-06-15T13:00:00Z' },
          assetGeneration: { status: 'completed', completedAt: '2024-06-15T13:30:00Z' },
          storyboardGeneration: { status: 'completed', completedAt: '2024-06-15T14:00:00Z' }
        }
      })
  },

  // ========== 48. GET /api/scripts/:id/asset-prompts - 资产提示词 ==========
  {
    url: '/api/scripts/:id/asset-prompts',
    method: 'get',
    response: () =>
      successResponse([
        {
          id: 'ap-001',
          assetName: '林小厨角色立绘',
          assetType: 'character',
          prompt: 'anime style, young male chef, age 25, slim build, bright eyes, wearing white chef uniform with blue apron, tall chef hat, holding a traditional Chinese cleaver, confident smile, warm lighting, detailed character design, full body portrait',
          negativePrompt: 'realistic, dark, horror, low quality',
          status: 'generated',
          imageUrl: '/uploads/assets/prompt-linxiaochu-full.jpg',
          generatedAt: '2024-06-15T13:00:00Z'
        },
        {
          id: 'ap-002',
          assetName: '御膳房场景',
          assetType: 'scene',
          prompt: 'anime style, imperial Chinese kitchen, grand interior, red lacquer wooden pillars, bronze cooking vessels, steam rising from pots, hanging lanterns, warm golden lighting, detailed architecture, wide angle view, bustling atmosphere',
          negativePrompt: 'modern, western, dark, abandoned',
          status: 'generated',
          imageUrl: '/uploads/assets/prompt-imperial-kitchen.jpg',
          generatedAt: '2024-06-15T13:15:00Z'
        },
        {
          id: 'ap-003',
          assetName: '祖传菜刀',
          assetType: 'prop',
          prompt: 'anime style, traditional Chinese cleaver, ornate handle with dragon engravings, gleaming blade, ancient craftsmanship, floating with magical aura, close-up product shot, dark background with spotlight',
          negativePrompt: 'modern, rusty, damaged, low quality',
          status: 'pending',
          imageUrl: '',
          generatedAt: null
        }
      ])
  },

  // ========== 49. GET /api/scripts/:id/asset-images - 资产图片 ==========
  {
    url: '/api/scripts/:id/asset-images',
    method: 'get',
    response: () =>
      successResponse([
        {
          id: 'ai-001',
          name: '林小厨-正面立绘',
          assetType: 'character',
          imageUrl: '/uploads/assets/char-linxiaochu-front.jpg',
          thumbnailUrl: '/uploads/assets/thumbnails/char-linxiaochu-front-thumb.jpg',
          resolution: '2048x2048',
          fileSize: '3.2MB',
          format: 'png',
          status: 'approved',
          createdAt: '2024-06-15T13:00:00Z'
        },
        {
          id: 'ai-002',
          name: '林小厨-侧面立绘',
          assetType: 'character',
          imageUrl: '/uploads/assets/char-linxiaochu-side.jpg',
          thumbnailUrl: '/uploads/assets/thumbnails/char-linxiaochu-side-thumb.jpg',
          resolution: '2048x2048',
          fileSize: '2.8MB',
          format: 'png',
          status: 'approved',
          createdAt: '2024-06-15T13:05:00Z'
        },
        {
          id: 'ai-003',
          name: '御膳房全景',
          assetType: 'scene',
          imageUrl: '/uploads/assets/scene-imperial-kitchen-wide.jpg',
          thumbnailUrl: '/uploads/assets/thumbnails/scene-imperial-kitchen-wide-thumb.jpg',
          resolution: '3840x2160',
          fileSize: '8.5MB',
          format: 'png',
          status: 'approved',
          createdAt: '2024-06-15T13:15:00Z'
        }
      ])
  },

  // ========== 50. GET /api/episodes/:id/video-prompts - 视频提示词 ==========
  {
    url: '/api/episodes/:id/video-prompts',
    method: 'get',
    response: () =>
      successResponse([
        {
          id: 'vp-001',
          sceneName: '穿越瞬间',
          storyboardId: '1',
          prompt: 'anime style, young chef in white uniform, standing in modern kitchen, sudden bright flash of light, magical energy swirling, clothes transforming from modern to ancient Chinese robes, dramatic lighting transition, camera slowly zooming in on face showing surprise expression, warm color palette shifting to golden tones',
          duration: 5,
          cameraMovement: 'zoom_in',
          shotType: 'close_up',
          status: 'ready',
          videoUrl: ''
        },
        {
          id: 'vp-002',
          sceneName: '初到古代',
          storyboardId: '2',
          prompt: 'anime style, young man in ancient Chinese clothes lying on stone path, surrounded by lush green bamboo forest, morning sunlight filtering through leaves, birds chirping, dolly shot from above slowly descending to ground level, peaceful countryside atmosphere, warm natural lighting',
          duration: 8,
          cameraMovement: 'dolly_down',
          shotType: 'high_angle',
          status: 'ready',
          videoUrl: ''
        },
        {
          id: 'vp-003',
          sceneName: '御膳房挑战',
          storyboardId: '3',
          prompt: 'anime style, grand imperial kitchen interior, young chef facing stern kitchen manager, dramatic tension, camera circling around both characters, steam rising from cooking stations, golden lantern light, showing determination in young chef eyes and authority in managers posture, epic confrontation atmosphere',
          duration: 10,
          cameraMovement: 'orbit',
          shotType: 'medium_shot',
          status: 'processing',
          videoUrl: ''
        }
      ])
  },

  // ========== 51. GET /api/projects/:id/webhooks - Webhook列表 ==========
  {
    url: '/api/projects/:id/webhooks',
    method: 'get',
    response: () =>
      successResponse([
        {
          id: 'wh-001',
          name: '剧本审核通知',
          url: 'https://hooks.example.com/script-review',
          events: ['script.submitted', 'script.approved', 'script.rejected'],
          secret: 'whsec_****',
          status: 'active',
          createdAt: '2024-03-01T00:00:00Z',
          lastTriggeredAt: '2024-06-15T11:00:00Z',
          lastResponseStatus: 200,
          triggerCount: 42
        },
        {
          id: 'wh-002',
          name: '视频生成完成通知',
          url: 'https://hooks.example.com/video-complete',
          events: ['video.completed', 'video.failed'],
          secret: 'whsec_****',
          status: 'active',
          createdAt: '2024-04-15T00:00:00Z',
          lastTriggeredAt: '2024-06-14T16:30:00Z',
          lastResponseStatus: 200,
          triggerCount: 18
        }
      ])
  },

  // ========== 52. POST /api/projects/:id/webhooks - 创建Webhook ==========
  {
    url: '/api/projects/:id/webhooks',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: 'wh-003',
        ...body,
        secret: 'whsec_' + Math.random().toString(36).substring(2, 10),
        status: 'active',
        createdAt: new Date().toISOString(),
        lastTriggeredAt: null,
        lastResponseStatus: null,
        triggerCount: 0
      }, 'Webhook已创建')
  },

  // ========== 53. PUT /api/projects/:id/webhooks/:id - 更新Webhook ==========
  {
    url: '/api/projects/:id/webhooks/:id',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: 'wh-001', ...body, updatedAt: new Date().toISOString() }, 'Webhook已更新')
  },

  // ========== 54. DELETE /api/projects/:id/webhooks/:id - 删除Webhook ==========
  {
    url: '/api/projects/:id/webhooks/:id',
    method: 'delete',
    response: () => successResponse(null, 'Webhook已删除')
  },

  // ========== 55. POST /api/projects/:id/webhooks/:id/test - 测试Webhook ==========
  {
    url: '/api/projects/:id/webhooks/:id/test',
    method: 'post',
    response: () =>
      successResponse({
        success: true,
        statusCode: 200,
        responseTime: 156,
        responseBody: '{"received": true}',
        sentAt: new Date().toISOString()
      }, 'Webhook测试成功')
  },
// ==================== 分镜 (Storyboards) ====================

  // 1. GET /api/projects/:id/storyboards - 分镜列表
  {
    url: '/api/projects/:id/storyboards',
    method: 'get',
    response: () => paginatedResponse(storyboards, storyboards.length)
  },

  // 2. POST /api/projects/:id/storyboards - 创建分镜
  {
    url: '/api/projects/:id/storyboards',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: '99',
        code: `SB-${String(storyboards.length + 1).padStart(3, '0')}`,
        source: 'script',
        sceneId: '',
        sceneName: '',
        description: '',
        thumbnail: '',
        shotCount: 0,
        duration: 0,
        status: 'pending',
        order: storyboards.length + 1,
        projectId: PROJECT_ID,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
  },

  // 3. GET /api/storyboards/:id - 分镜详情
  {
    url: '/api/storyboards/:id',
    method: 'get',
    response: () => successResponse(storyboards[0])
  },

  // 4. PUT /api/storyboards/:id - 更新分镜
  {
    url: '/api/storyboards/:id',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ ...storyboards[0], ...body, updatedAt: new Date().toISOString() })
  },

  // 5. DELETE /api/storyboards/:id - 删除分镜
  {
    url: '/api/storyboards/:id',
    method: 'delete',
    response: () => successResponse(null, '删除成功')
  },

  // 6. DELETE /api/storyboards/batch-delete - 批量删除分镜
  {
    url: '/api/storyboards/batch-delete',
    method: 'delete',
    response: () => successResponse(null, '批量删除成功')
  },

  // 7. POST /api/storyboards/:id/submit-review - 提交审核
  {
    url: '/api/storyboards/:id/submit-review',
    method: 'post',
    response: () => successResponse({ status: 'pending' }, '已提交审核')
  },

  // 8. POST /api/storyboards/batch-submit-review - 批量提交审核
  {
    url: '/api/storyboards/batch-submit-review',
    method: 'post',
    response: () => successResponse({ submittedCount: 3 }, '批量提交审核成功')
  },

  // 9. POST /api/storyboards/:id/withdraw-review - 撤回审核
  {
    url: '/api/storyboards/:id/withdraw-review',
    method: 'post',
    response: () => successResponse(null, '已撤回审核')
  },

  // 10. GET /api/storyboards/:id/review-status - 审核状态
  {
    url: '/api/storyboards/:id/review-status',
    method: 'get',
    response: () =>
      successResponse({
        status: 'approved',
        reviewer: '李导演',
        reviewedAt: '2024-06-10T14:00:00Z',
        comment: '分镜设计出色，画面构图合理，通过审核',
        violations: []
      })
  },

  // 11. GET /api/storyboards/:id/versions - 版本列表
  {
    url: '/api/storyboards/:id/versions',
    method: 'get',
    response: () =>
      successResponse([
        { versionNumber: 3, createdAt: '2024-06-10T14:00:00Z', createdBy: '王编剧', description: '调整镜头3的构图，增加特写镜头' },
        { versionNumber: 2, createdAt: '2024-06-05T10:00:00Z', createdBy: '李导演', description: '修改分镜描述，优化节奏感' },
        { versionNumber: 1, createdAt: '2024-02-01T09:00:00Z', createdBy: '张制片', description: '初始版本，基于剧本第一集拆解生成' }
      ])
  },

  // 12. POST /api/storyboards/:id/versions/:versionId/rollback - 版本回滚
  {
    url: '/api/storyboards/:id/versions/:versionId/rollback',
    method: 'post',
    response: () => successResponse(null, '版本回滚成功')
  },

  // 13. GET /api/storyboards/:id/images - 分镜图片
  {
    url: '/api/storyboards/:id/images',
    method: 'get',
    response: () => successResponse(storyboardImages['1'] || [])
  },

  // 14. POST /api/storyboards/:id/images - 添加分镜图片
  {
    url: '/api/storyboards/:id/images',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `img-${Date.now()}`,
        url: '',
        thumbnail: '',
        prompt: '',
        ...body,
        createdAt: new Date().toISOString()
      })
  },

  // 15. DELETE /api/storyboards/images/:id - 删除分镜图片
  {
    url: '/api/storyboards/images/:id',
    method: 'delete',
    response: () => successResponse(null, '图片删除成功')
  },

  // 16. GET /api/storyboards/:id/assets - 分镜关联资产
  {
    url: '/api/storyboards/:id/assets',
    method: 'get',
    response: () => successResponse(storyboardAssets['1'] || [])
  },

  // 17. POST /api/storyboards/:id/assets - 关联资产
  {
    url: '/api/storyboards/:id/assets',
    method: 'post',
    response: () => successResponse(null, '资产关联成功')
  },

  // 18. DELETE /api/storyboards/:id/assets/:assetId - 取消关联资产
  {
    url: '/api/storyboards/:id/assets/:assetId',
    method: 'delete',
    response: () => successResponse(null, '已取消资产关联')
  },

  // 19. POST /api/projects/:id/scripts/:scriptId/episodes/:episodeId/storyboard/decompose - 剧本拆解分镜
  {
    url: '/api/projects/:id/scripts/:scriptId/episodes/:episodeId/storyboard/decompose',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-decompose-001',
        status: 'processing',
        estimatedTime: 60,
        message: '正在将剧本拆解为分镜，请稍候...'
      })
  },

  // 20. GET /api/projects/:id/scripts/:scriptId/storyboards - 剧本关联分镜
  {
    url: '/api/projects/:id/scripts/:scriptId/storyboards',
    method: 'get',
    response: () => successResponse(storyboards.filter(s => s.source === 'script'))
  },

  // 21. GET /api/scenes - 场景列表
  {
    url: '/api/scenes',
    method: 'get',
    response: () => successResponse(scenes)
  },

  // 22. POST /api/scenes - 创建场景
  {
    url: '/api/scenes',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `scene-${Date.now()}`,
        projectId: PROJECT_ID,
        ...body,
        createdAt: new Date().toISOString()
      })
  },

  // 23. GET /api/episodes/:episodeId/scenes - 分集场景
  {
    url: '/api/episodes/:episodeId/scenes',
    method: 'get',
    response: () => successResponse(scenes)
  },

  // 24. PUT /api/scenes/:sceneId/storyboards/reorder - 分镜排序
  {
    url: '/api/scenes/:sceneId/storyboards/reorder',
    method: 'put',
    response: () => successResponse(null, '排序更新成功')
  },

  // ==================== 资产 (Assets) ====================

  // 25. GET /api/projects/:id/assets - 资产列表
  {
    url: '/api/projects/:id/assets',
    method: 'get',
    response: () => paginatedResponse(assets, assets.length)
  },

  // 26. POST /api/projects/:id/assets - 上传资产
  {
    url: '/api/projects/:id/assets',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `asset-${Date.now()}`,
        projectId: PROJECT_ID,
        tags: [],
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
  },

  // 27. GET /api/projects/:id/assets/:assetId - 资产详情
  {
    url: '/api/projects/:id/assets/:assetId',
    method: 'get',
    response: () => successResponse(assets[0])
  },

  // 28. PUT /api/projects/:id/assets/:assetId - 更新资产
  {
    url: '/api/projects/:id/assets/:assetId',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ ...assets[0], ...body, updatedAt: new Date().toISOString() })
  },

  // 29. DELETE /api/projects/:id/assets/:assetId - 删除资产
  {
    url: '/api/projects/:id/assets/:assetId',
    method: 'delete',
    response: () => successResponse(null, '资产删除成功')
  },

  // 30. DELETE /api/projects/:id/assets/batch-delete - 批量删除资产
  {
    url: '/api/projects/:id/assets/batch-delete',
    method: 'delete',
    response: () => successResponse(null, '批量删除成功')
  },

  // 31. GET /api/projects/:id/assets/:assetId/download - 下载资产
  {
    url: '/api/projects/:id/assets/:assetId/download',
    method: 'get',
    response: () => successResponse({ downloadUrl: 'https://example.com/download/asset-001' })
  },

  // 32. POST /api/projects/:id/assets/batch-download - 批量下载
  {
    url: '/api/projects/:id/assets/batch-download',
    method: 'post',
    response: () => successResponse({ downloadUrl: 'https://example.com/download/batch-20240615', fileCount: 3 })
  },

  // 33. GET /api/projects/:id/assets/:assetId/versions - 资产版本
  {
    url: '/api/projects/:id/assets/:assetId/versions',
    method: 'get',
    response: () =>
      successResponse([
        { versionNumber: 2, createdAt: '2024-06-01T10:00:00Z', createdBy: '王美术', fileSize: 2048000, description: '优化画质，调整色调' },
        { versionNumber: 1, createdAt: '2024-01-10T08:00:00Z', createdBy: '刘美术', fileSize: 1536000, description: '初始版本上传' }
      ])
  },

  // 34. POST /api/projects/:id/assets/:assetId/rollback - 资产版本回滚
  {
    url: '/api/projects/:id/assets/:assetId/rollback',
    method: 'post',
    response: () => successResponse(null, '版本回滚成功')
  },

  // 35. POST /api/projects/:id/assets/chunk-init - 分片上传初始化
  {
    url: '/api/projects/:id/assets/chunk-init',
    method: 'post',
    response: () =>
      successResponse({
        uploadId: `upload-${Date.now()}`,
        chunkSize: 1048576,
        totalChunks: 10
      })
  },

  // 36. POST /api/projects/:id/assets/chunk-upload - 分片上传
  {
    url: '/api/projects/:id/assets/chunk-upload',
    method: 'post',
    response: () => successResponse({ uploaded: true }, '分片上传成功')
  },

  // 37. POST /api/projects/:id/assets/chunk-complete - 分片上传完成
  {
    url: '/api/projects/:id/assets/chunk-complete',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `asset-${Date.now()}`,
        name: '上传文件',
        assetType: 'image',
        category: 'scene',
        url: '',
        projectId: PROJECT_ID,
        ...body,
        createdAt: new Date().toISOString()
      })
  },

  // 38. DELETE /api/projects/:id/assets/chunk-cancel - 取消上传
  {
    url: '/api/projects/:id/assets/chunk-cancel',
    method: 'delete',
    response: () => successResponse(null, '上传已取消')
  },

  // 39. POST /api/projects/:id/assets/batch - 批量上传
  {
    url: '/api/projects/:id/assets/batch',
    method: 'post',
    response: () =>
      successResponse([
        { id: 'batch-asset-001', name: '批量上传-01', status: 'success' },
        { id: 'batch-asset-002', name: '批量上传-02', status: 'success' },
        { id: 'batch-asset-003', name: '批量上传-03', status: 'success' }
      ])
  },

  // 40. POST /api/projects/:id/assets/batch-tags - 批量添加标签
  {
    url: '/api/projects/:id/assets/batch-tags',
    method: 'post',
    response: () => successResponse(null, '标签添加成功')
  },

  // 41. DELETE /api/projects/:id/assets/batch-tags - 批量移除标签
  {
    url: '/api/projects/:id/assets/batch-tags',
    method: 'delete',
    response: () => successResponse(null, '标签移除成功')
  },

  // 42. POST /api/projects/:id/assets/batch-move - 批量移动
  {
    url: '/api/projects/:id/assets/batch-move',
    method: 'post',
    response: () => successResponse(null, '批量移动成功')
  },

  // 43. POST /api/projects/:id/assets/ai-generate - AI生成资产
  {
    url: '/api/projects/:id/assets/ai-generate',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'ai-gen-001',
        status: 'processing',
        estimatedTime: 30,
        message: 'AI正在生成资产，请稍候...'
      })
  },

  // 44. GET /api/projects/:id/assets/reference-images - 参考图列表
  {
    url: '/api/projects/:id/assets/reference-images',
    method: 'get',
    response: () =>
      successResponse([
        { id: 'ref-001', name: '古风场景参考', url: '', thumbnail: '', category: 'scene', uploadedBy: '王美术', createdAt: '2024-03-01T10:00:00Z' },
        { id: 'ref-002', name: '角色造型参考', url: '', thumbnail: '', category: 'character', uploadedBy: '刘美术', createdAt: '2024-03-05T14:00:00Z' }
      ])
  },

  // 45. POST /api/projects/:id/assets/reference-images - 上传参考图
  {
    url: '/api/projects/:id/assets/reference-images',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `ref-${Date.now()}`,
        url: '',
        thumbnail: '',
        ...body,
        createdAt: new Date().toISOString()
      })
  },

  // 46. DELETE /api/projects/:id/assets/reference-images/:assetId - 删除参考图
  {
    url: '/api/projects/:id/assets/reference-images/:assetId',
    method: 'delete',
    response: () => successResponse(null, '参考图删除成功')
  },

  // 47. POST /api/projects/:id/assets/import-from-team - 从团队导入资产
  {
    url: '/api/projects/:id/assets/import-from-team',
    method: 'post',
    response: () => successResponse({ importedCount: 3 }, '团队资产导入成功')
  },

  // 48. GET /api/teams/:id/assets - 团队资产列表
  {
    url: '/api/teams/:id/assets',
    method: 'get',
    response: () => paginatedResponse(teamAssets, teamAssets.length)
  },

  // 49. POST /api/teams/:id/assets - 上传团队资产
  {
    url: '/api/teams/:id/assets',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `team-asset-${Date.now()}`,
        teamId: '1',
        ...body,
        createdAt: new Date().toISOString()
      })
  },

  // 50. GET /api/teams/:id/assets/:assetId - 团队资产详情
  {
    url: '/api/teams/:id/assets/:assetId',
    method: 'get',
    response: () => successResponse(teamAssets[0])
  },

  // 51. GET /api/teams/:id/assets/categories - 团队资产分类
  {
    url: '/api/teams/:id/assets/categories',
    method: 'get',
    response: () => successResponse(['角色', '场景', '道具', '特效', '音频'])
  },

  // 52. GET /api/teams/:id/asset-categories - 团队资产分类(别名)
  {
    url: '/api/teams/:id/asset-categories',
    method: 'get',
    response: () => successResponse(['角色', '场景', '道具', '特效', '音频'])
  },

  // ==================== 角色 (Characters) ====================

  // 53. GET /api/projects/:id/characters - 角色列表
  {
    url: '/api/projects/:id/characters',
    method: 'get',
    response: () => successResponse(characters)
  },

  // 54. POST /api/projects/:id/characters - 创建角色
  {
    url: '/api/projects/:id/characters',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({
        id: `char-${Date.now()}`,
        code: `CHAR-${String(characters.length + 1).padStart(3, '0')}`,
        projectId: PROJECT_ID,
        avatar: '',
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
  },

  // 55. GET /api/projects/:id/characters/:characterId - 角色详情
  {
    url: '/api/projects/:id/characters/:characterId',
    method: 'get',
    response: () => successResponse(characters[0])
  },

  // 56. PUT /api/projects/:id/characters/:characterId - 更新角色
  {
    url: '/api/projects/:id/characters/:characterId',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ ...characters[0], ...body, updatedAt: new Date().toISOString() })
  },

  // 57. DELETE /api/projects/:id/characters/:characterId - 删除角色
  {
    url: '/api/projects/:id/characters/:characterId',
    method: 'delete',
    response: () => successResponse(null, '角色删除成功')
  },

  // 58. POST /api/projects/:id/characters/:characterId/link/:storyboardId - 关联分镜
  {
    url: '/api/projects/:id/characters/:characterId/link/:storyboardId',
    method: 'post',
    response: () => successResponse(null, '角色关联分镜成功')
  },

  // 59. DELETE /api/projects/:id/characters/:characterId/unlink/:storyboardId - 取消关联
  {
    url: '/api/projects/:id/characters/:characterId/unlink/:storyboardId',
    method: 'delete',
    response: () => successResponse(null, '已取消角色关联')
  },

  // 60. GET /api/projects/:id/characters/by-storyboard/:storyboardId - 分镜角色
  {
    url: '/api/projects/:id/characters/by-storyboard/:storyboardId',
    method: 'get',
    response: () => successResponse([characters[0], characters[2]])
  },

  // ==================== 图片生成 (GPT-Image) ====================

  // 61. POST /api/gpt-image/generations - 提交图片生成
  {
    url: '/api/gpt-image/generations',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'image-task-001',
        status: 'pending',
        estimatedTime: 45,
        message: '图片生成任务已提交'
      })
  },

  // 62. GET /api/gpt-image/tasks/:id - 图片生成任务状态
  {
    url: '/api/gpt-image/tasks/:id',
    method: 'get',
    response: () =>
      successResponse({
        id: 'image-task-001',
        status: 'completed',
        progress: 100,
        model: 'dall-e-3',
        createdAt: '2024-06-15T10:00:00Z',
        completedAt: '2024-06-15T10:00:45Z'
      })
  },

  // 63. GET /api/gpt-image/tasks/:id/review-status - 图片审核状态
  {
    url: '/api/gpt-image/tasks/:id/review-status',
    method: 'get',
    response: () =>
      successResponse({
        status: 'approved',
        reviewer: '系统自动审核',
        reviewedAt: '2024-06-15T10:01:00Z',
        violations: []
      })
  },

  // 64. GET /api/gpt-image/tasks/:id/result - 图片生成结果
  {
    url: '/api/gpt-image/tasks/:id/result',
    method: 'get',
    response: () =>
      successResponse({
        imageUrl: 'https://example.com/generated/image-task-001.png',
        thumbnailUrl: 'https://example.com/generated/image-task-001-thumb.png',
        prompt: '一位身穿白色厨师服的阳光少年站在古代厨房中，手握菜刀，自信微笑，古风写实风格，高清画质',
        revisedPrompt: 'A young man in white chef uniform standing in an ancient Chinese kitchen, holding a cleaver, confident smile, realistic ancient Chinese style, HD quality',
        model: 'dall-e-3',
        size: '1024x1024',
        createdAt: '2024-06-15T10:00:00Z'
      })
  },

  // 65. GET /api/gpt-image/models - 图片生成模型列表
  {
    url: '/api/gpt-image/models',
    method: 'get',
    response: () =>
      successResponse([
        { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI最新图像生成模型，支持高质量写实和艺术风格', maxResolution: '1024x1792', pricing: 0.04 },
        { id: 'dall-e-2', name: 'DALL-E 2', description: '经典图像生成模型，生成速度快，适合批量任务', maxResolution: '1024x1024', pricing: 0.02 },
        { id: 'stable-diffusion', name: 'Stable Diffusion', description: '开源图像模型，支持自定义风格和微调', maxResolution: '1536x1536', pricing: 0.01 }
      ])
  },

  // ==================== 视频生成 (Seedance) ====================

  // 66. POST /api/seedance/generations - 提交视频生成
  {
    url: '/api/seedance/generations',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'video-task-006',
        status: 'pending',
        estimatedTime: 180,
        message: '视频生成任务已提交，请耐心等待'
      })
  },

  // 67. POST /api/seedance/generations/preview - 视频预览
  {
    url: '/api/seedance/generations/preview',
    method: 'post',
    response: () =>
      successResponse({
        previewUrl: 'https://example.com/preview/seedance-preview-001.mp4',
        duration: 3,
        resolution: '512x512'
      })
  },

  // 68. GET /api/seedance/tasks - 视频生成任务列表
  {
    url: '/api/seedance/tasks',
    method: 'get',
    response: () => paginatedResponse(seedanceTasks, seedanceTasks.length)
  },

  // 69. GET /api/seedance/tasks/:id - 视频任务详情
  {
    url: '/api/seedance/tasks/:id',
    method: 'get',
    response: () => successResponse(seedanceTasks[0])
  },

  // 70. GET /api/seedance/tasks/:id/result - 视频生成结果
  {
    url: '/api/seedance/tasks/:id/result',
    method: 'get',
    response: () =>
      successResponse({
        videoUrl: 'https://example.com/videos/video-task-001.mp4',
        coverImage: 'https://example.com/covers/video-task-001.jpg',
        duration: 15,
        resolution: '1920x1080',
        fileSize: 25600000,
        format: 'mp4',
        createdAt: '2024-06-10T08:00:00Z',
        completedAt: '2024-06-10T08:15:00Z'
      })
  },

  // 71. POST /api/seedance/tasks/:id/cancel - 取消视频任务
  {
    url: '/api/seedance/tasks/:id/cancel',
    method: 'post',
    response: () => successResponse(null, '视频生成任务已取消')
  },

  // ==================== 视频提示词 (Video Prompts) ====================

  // 72. POST /api/projects/:id/scripts/:scriptId/episodes/:episodeId/video-prompts - 生成视频提示词
  {
    url: '/api/projects/:id/scripts/:scriptId/episodes/:episodeId/video-prompts',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'vp-gen-001',
        status: 'processing',
        estimatedTime: 30,
        message: '正在基于剧本生成视频提示词...'
      })
  },

  // 73. POST /api/projects/:id/scripts/:scriptId/episodes/:episodeId/video-prompts/violation-check - 违规检查
  {
    url: '/api/projects/:id/scripts/:scriptId/episodes/:episodeId/video-prompts/violation-check',
    method: 'post',
    response: () =>
      successResponse({
        passed: true,
        violations: [],
        checkedAt: new Date().toISOString(),
        message: '提示词内容合规，未发现违规项'
      })
  },

  // 74. POST /api/projects/:id/scripts/:scriptId/episodes/:episodeId/video-prompts/fix - 修复提示词
  {
    url: '/api/projects/:id/scripts/:scriptId/episodes/:episodeId/video-prompts/fix',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'vp-fix-001',
        status: 'processing',
        estimatedTime: 20,
        message: '正在优化修复视频提示词...'
      })
  },
// ==================== 团队 ====================
  {
    url: '/api/teams/member/teams',
    method: 'get',
    response: () =>
      successResponse([
        { teamId: '1', teamName: '创意工作室', teamAvatar: '', role: 'owner', memberCount: 12, isCurrent: true },
        { teamId: '2', teamName: '影视制作部', teamAvatar: '', role: 'editor', memberCount: 8, isCurrent: false }
      ])
  },
  {
    url: '/api/teams/:teamId',
    method: 'get',
    response: () =>
      successResponse({
        id: '1',
        name: '创意工作室',
        description: '专注于AI短剧创作的精英团队',
        avatar: '',
        ownerName: '张制片',
        memberCount: 12,
        projectCount: 8,
        createdAt: '2023-06-01T00:00:00Z'
      })
  },
  {
    url: '/api/teams/:teamId',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '1', ...body, updatedAt: new Date().toISOString() })
  },
  {
    url: '/api/teams/member/switch',
    method: 'post',
    response: () => successResponse(null, '切换成功')
  },
  {
    url: '/api/teams/member/apply',
    method: 'post',
    response: () => successResponse(null, '申请已提交')
  },
  {
    url: '/api/teams/member/join-by-code',
    method: 'post',
    response: () => successResponse(null, '加入成功')
  },
  {
    url: '/api/teams/member/leave',
    method: 'post',
    response: () => successResponse(null, '已退出团队')
  },
  {
    url: '/api/teams/member/applications',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', teamId: '3', teamName: '动画团队', userId: '10', userName: '新用户', userAvatar: '', status: 'pending', reason: '希望加入团队参与动画制作', rejectReason: '', applyTime: '2024-06-14T10:00:00Z', processTime: '' }
      ])
  },
  {
    url: '/api/teams/:teamId/members',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', userId: '1', userName: '张制片', avatar: '', role: 'owner', joinTime: '2023-06-01T00:00:00Z', lastActiveTime: '2024-06-15T10:30:00Z' },
        { id: '2', userId: '2', userName: '李导演', avatar: '', role: 'admin', joinTime: '2023-07-15T00:00:00Z', lastActiveTime: '2024-06-15T09:20:00Z' },
        { id: '3', userId: '3', userName: '王编剧', avatar: '', role: 'editor', joinTime: '2023-08-01T00:00:00Z', lastActiveTime: '2024-06-14T18:00:00Z' },
        { id: '4', userId: '4', userName: '刘美术', avatar: '', role: 'editor', joinTime: '2023-09-10T00:00:00Z', lastActiveTime: '2024-06-15T08:45:00Z' },
        { id: '5', userId: '5', userName: '赵剪辑', avatar: '', role: 'editor', joinTime: '2023-10-01T00:00:00Z', lastActiveTime: '2024-06-13T16:30:00Z' },
        { id: '6', userId: '6', userName: '陈音效', avatar: '', role: 'editor', joinTime: '2024-01-15T00:00:00Z', lastActiveTime: '2024-06-14T14:20:00Z' },
        { id: '7', userId: '7', userName: '周特效', avatar: '', role: 'editor', joinTime: '2024-02-01T00:00:00Z', lastActiveTime: '2024-06-15T11:00:00Z' },
        { id: '8', userId: '8', userName: '吴运营', avatar: '', role: 'viewer', joinTime: '2024-03-01T00:00:00Z', lastActiveTime: '2024-06-12T10:00:00Z' }
      ], 8)
  },
  {
    url: '/api/teams/:teamId/members/import',
    method: 'post',
    response: () => successResponse(null, '导入成功')
  },
  {
    url: '/api/teams/:teamId/members/role',
    method: 'put',
    response: () => successResponse(null, '角色更新成功')
  },
  {
    url: '/api/teams/:teamId/members/status',
    method: 'put',
    response: () => successResponse(null, '状态更新成功')
  },
  {
    url: '/api/teams/:teamId/members/:memberId',
    method: 'delete',
    response: () => successResponse(null, '成员已移除')
  },
  {
    url: '/api/teams/:teamId/members/:memberId/permissions',
    method: 'get',
    response: () => successResponse({ permissions: ['project.create', 'project.edit', 'script.create', 'script.edit', 'storyboard.create', 'asset.upload'] })
  },
  {
    url: '/api/teams/:teamId/members/:memberId/permissions',
    method: 'put',
    response: () => successResponse(null, '权限更新成功')
  },
  {
    url: '/api/teams/:teamId/owner',
    method: 'put',
    response: () => successResponse(null, '所有权转移成功')
  },
  {
    url: '/api/teams/:teamId/roles',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '超级管理员', description: '拥有所有权限', memberCount: 1, isDefault: false },
        { id: '2', name: '项目经理', description: '管理项目和成员', memberCount: 2, isDefault: false },
        { id: '3', name: '创作人员', description: '创作和编辑内容', memberCount: 7, isDefault: true },
        { id: '4', name: '查看者', description: '只读权限', memberCount: 2, isDefault: false }
      ])
  },
  {
    url: '/api/teams/:teamId/roles',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '5', ...body, memberCount: 0, createdAt: new Date().toISOString() })
  },
  {
    url: '/api/teams/:teamId/roles/:roleId',
    method: 'put',
    response: () => successResponse(null, '角色更新成功')
  },
  {
    url: '/api/teams/:teamId/roles/:roleId',
    method: 'delete',
    response: () => successResponse(null, '角色删除成功')
  },
  {
    url: '/api/teams/:teamId/roles/:roleId/permissions',
    method: 'get',
    response: () =>
      successResponse({
        roleId: '3',
        roleName: '创作人员',
        permissions: [
          { code: 'project.view', name: '查看项目', enabled: true },
          { code: 'project.create', name: '创建项目', enabled: true },
          { code: 'project.edit', name: '编辑项目', enabled: true },
          { code: 'script.create', name: '创建剧本', enabled: true },
          { code: 'script.edit', name: '编辑剧本', enabled: true },
          { code: 'storyboard.create', name: '创建分镜', enabled: true },
          { code: 'storyboard.edit', name: '编辑分镜', enabled: true },
          { code: 'asset.upload', name: '上传资产', enabled: true },
          { code: 'asset.delete', name: '删除资产', enabled: false },
          { code: 'review.submit', name: '提交审核', enabled: true }
        ]
      })
  },
  {
    url: '/api/teams/:teamId/roles/:roleId/permissions',
    method: 'put',
    response: () => successResponse(null, '权限设置成功')
  },
  {
    url: '/api/teams/:teamId/available-permissions',
    method: 'get',
    response: () =>
      successResponse([
        { code: 'project.view', name: '查看项目', category: '项目' },
        { code: 'project.create', name: '创建项目', category: '项目' },
        { code: 'project.edit', name: '编辑项目', category: '项目' },
        { code: 'project.delete', name: '删除项目', category: '项目' },
        { code: 'script.create', name: '创建剧本', category: '剧本' },
        { code: 'script.edit', name: '编辑剧本', category: '剧本' },
        { code: 'script.delete', name: '删除剧本', category: '剧本' },
        { code: 'storyboard.create', name: '创建分镜', category: '分镜' },
        { code: 'storyboard.edit', name: '编辑分镜', category: '分镜' },
        { code: 'storyboard.delete', name: '删除分镜', category: '分镜' },
        { code: 'asset.upload', name: '上传资产', category: '资产' },
        { code: 'asset.delete', name: '删除资产', category: '资产' },
        { code: 'review.submit', name: '提交审核', category: '审核' },
        { code: 'review.approve', name: '审批审核', category: '审核' },
        { code: 'member.manage', name: '管理成员', category: '团队' }
      ])
  },
  {
    url: '/api/teams/member/permissions',
    method: 'get',
    response: () => successResponse(['*'])
  },
  {
    url: '/api/teams/:teamId/invite-codes',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', code: 'INV-2024-A1B2C3', creatorName: '张制片', usageCount: 3, maxUsage: 10, expireTime: '2024-07-15T00:00:00Z', status: 'active', createdAt: '2024-06-01T00:00:00Z' },
        { id: '2', code: 'INV-2024-D4E5F6', creatorName: '张制片', usageCount: 1, maxUsage: 5, expireTime: '2024-06-30T00:00:00Z', status: 'active', createdAt: '2024-06-10T00:00:00Z' },
        { id: '3', code: 'INV-2024-G7H8I9', creatorName: '李导演', usageCount: 5, maxUsage: 5, expireTime: '2024-06-20T00:00:00Z', status: 'expired', createdAt: '2024-05-15T00:00:00Z' }
      ], 3)
  },
  {
    url: '/api/teams/:teamId/invite-codes',
    method: 'post',
    response: () =>
      successResponse({ id: '4', code: 'INV-2024-NEW123', usageCount: 0, maxUsage: 10, status: 'active', createdAt: new Date().toISOString() })
  },
  {
    url: '/api/teams/:teamId/invite-codes/:id',
    method: 'delete',
    response: () => successResponse(null, '邀请码已撤销')
  },
  {
    url: '/api/teams/:teamId/applications',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', userId: '10', userName: '新用户A', userAvatar: '', status: 'pending', reason: '擅长动画制作，希望加入团队', applyTime: '2024-06-14T10:00:00Z', processTime: '' },
        { id: '2', userId: '11', userName: '新用户B', userAvatar: '', status: 'approved', reason: '有3年视频剪辑经验', applyTime: '2024-06-10T14:00:00Z', processTime: '2024-06-11T09:00:00Z' }
      ], 2)
  },
  {
    url: '/api/teams/:teamId/applications/:id/approve',
    method: 'put',
    response: () => successResponse(null, '审批通过')
  },
  {
    url: '/api/teams/:teamId/applications/:id/reject',
    method: 'put',
    response: () => successResponse(null, '已拒绝')

  // ==================== 管理 - 用户 ====================
  },
  {
    url: '/api/admin/users',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', userName: 'Super', email: 'admin@example.com', avatar: '', roles: ['platform_admin'], status: 'active', lastLoginTime: '2024-06-15T10:00:00Z', createdAt: '2023-01-01T00:00:00Z' },
        { id: '2', userName: '张三', email: 'zhangsan@example.com', avatar: '', roles: ['team_admin'], status: 'active', lastLoginTime: '2024-06-15T09:30:00Z', createdAt: '2023-03-15T00:00:00Z' },
        { id: '3', userName: '李四', email: 'lisi@example.com', avatar: '', roles: ['team_member'], status: 'active', lastLoginTime: '2024-06-14T16:00:00Z', createdAt: '2023-05-01T00:00:00Z' },
        { id: '4', userName: '王五', email: 'wangwu@example.com', avatar: '', roles: ['team_member'], status: 'active', lastLoginTime: '2024-06-13T14:00:00Z', createdAt: '2023-06-20T00:00:00Z' },
        { id: '5', userName: '赵六', email: 'zhaoliu@example.com', avatar: '', roles: ['team_member'], status: 'disabled', lastLoginTime: '2024-05-20T10:00:00Z', createdAt: '2023-08-01T00:00:00Z' },
        { id: '6', userName: '陈七', email: 'chenqi@example.com', avatar: '', roles: ['team_member'], status: 'active', lastLoginTime: '2024-06-15T08:00:00Z', createdAt: '2023-09-10T00:00:00Z' },
        { id: '7', userName: '周八', email: 'zhouba@example.com', avatar: '', roles: ['team_member'], status: 'active', lastLoginTime: '2024-06-14T11:00:00Z', createdAt: '2023-10-15T00:00:00Z' },
        { id: '8', userName: '吴九', email: 'wujiu@example.com', avatar: '', roles: ['team_member'], status: 'active', lastLoginTime: '2024-06-12T15:00:00Z', createdAt: '2024-01-01T00:00:00Z' },
        { id: '9', userName: '郑十', email: 'zhengshi@example.com', avatar: '', roles: ['team_admin'], status: 'active', lastLoginTime: '2024-06-15T07:30:00Z', createdAt: '2024-02-01T00:00:00Z' },
        { id: '10', userName: '冯十一', email: 'feng11@example.com', avatar: '', roles: ['team_member'], status: 'active', lastLoginTime: '2024-06-10T09:00:00Z', createdAt: '2024-03-15T00:00:00Z' }
      ], 10)
  },
  {
    url: '/api/admin/users/:id',
    method: 'get',
    response: () =>
      successResponse({
        id: '1',
        userName: 'Super',
        email: 'admin@example.com',
        avatar: '',
        roles: ['platform_admin'],
        status: 'active',
        lastLoginTime: '2024-06-15T10:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        teamCount: 2,
        projectCount: 8
      })
  },
  {
    url: '/api/admin/users/:id/status',
    method: 'put',
    response: () => successResponse(null, '状态更新成功')
  },
  {
    url: '/api/v3/system/menus/simple',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '仪表盘', icon: 'ri-dashboard-3-line', path: '/dashboard', sort: 1, children: [] },
        { id: '2', name: '项目管理', icon: 'ri-projector-2-line', path: '/project', sort: 2, children: [
          { id: '2-1', name: '项目列表', path: '/project/list', sort: 1 },
          { id: '2-2', name: '项目编辑', path: '/project/edit', sort: 2 }
        ]},
        { id: '3', name: '剧本管理', icon: 'ri-file-text-line', path: '/script', sort: 3, children: [] },
        { id: '4', name: '分镜管理', icon: 'ri-film-line', path: '/storyboard', sort: 4, children: [] },
        { id: '5', name: '视频生成', icon: 'ri-video-on-line', path: '/video-gen', sort: 5, children: [] },
        { id: '6', name: '剪辑工作台', icon: 'ri-scissors-line', path: '/editor', sort: 6, children: [] },
        { id: '7', name: '审核中心', icon: 'ri-checkbox-circle-line', path: '/review', sort: 7, children: [] },
        { id: '8', name: '资产管理', icon: 'ri-folder-image-line', path: '/asset', sort: 8, children: [] },
        { id: '10', name: 'AI处理记录', icon: 'ri-robot-2-line', path: '/ai-process', sort: 10, children: [] },
        { id: '11', name: '数据历史', icon: 'ri-history-line', path: '/data-history', sort: 11, children: [] },
        { id: '12', name: '工作流管理', icon: 'ri-flow-chart', path: '/workflow', sort: 12, children: [] },
        { id: '13', name: '团队管理', icon: 'ri-team-line', path: '/team', sort: 13, children: [] },
        { id: '14', name: '积分管理', icon: 'ri-coin-line', path: '/points', sort: 14, children: [] },
        { id: '15', name: '通知中心', icon: 'ri-notification-3-line', path: '/notice', sort: 15, children: [] },
        { id: '16', name: '系统设置', icon: 'ri-settings-3-line', path: '/settings', sort: 16, children: [] },
        { id: '17', name: '系统管理', icon: 'ri-admin-line', path: '/system', sort: 17, children: [] }
      ])
  },
  {
    url: '/api/admin/roles',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', name: 'platform_admin', label: '平台管理员', description: '平台管理员，拥有所有权限', userCount: 1, createdAt: '2023-01-01T00:00:00Z' },
        { id: '2', name: 'team_admin', label: '团队管理员', description: '团队管理员，管理团队成员和配置', userCount: 3, createdAt: '2023-01-01T00:00:00Z' },
        { id: '3', name: 'team_member', label: '团队成员', description: '团队成员，使用平台功能', userCount: 6, createdAt: '2023-01-01T00:00:00Z' },
        { id: '4', name: 'member', label: '成员', description: '普通成员，基本功能权限', userCount: 10, createdAt: '2023-01-01T00:00:00Z' }
      ], 2)
  },

  // ==================== 管理 - 团队 ====================
  {
    url: '/api/admin/teams',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', name: '创意工作室', ownerName: '张制片', memberCount: 12, projectCount: 8, status: 'active', createdAt: '2023-06-01T00:00:00Z' },
        { id: '2', name: '影视制作部', ownerName: '李导演', memberCount: 8, projectCount: 5, status: 'active', createdAt: '2023-07-15T00:00:00Z' },
        { id: '3', name: '动画团队', ownerName: '王编剧', memberCount: 6, projectCount: 3, status: 'active', createdAt: '2023-09-01T00:00:00Z' }
      ], 3)
  },
  {
    url: '/api/admin/teams',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '4', ...body, status: 'active', createdAt: new Date().toISOString() })
  },
  {
    url: '/api/admin/teams/:teamId',
    method: 'get',
    response: () =>
      successResponse({
        id: '1', name: '创意工作室', description: '专注于AI短剧创作', ownerName: '张制片', memberCount: 12, projectCount: 8, status: 'active', createdAt: '2023-06-01T00:00:00Z'
      })
  },
  {
    url: '/api/admin/teams/:teamId',
    method: 'put',
    response: () => successResponse(null, '更新成功')
  },
  {
    url: '/api/admin/teams/:teamId',
    method: 'delete',
    response: () => successResponse(null, '删除成功')
  },
  {
    url: '/api/admin/teams/:teamId/status',
    method: 'put',
    response: () => successResponse(null, '状态更新成功')
  },
  {
    url: '/api/admin/teams/:teamId/owner',
    method: 'put',
    response: () => successResponse(null, '所有权转移成功')
  },
  {
    url: '/api/admin/teams/:teamId/members',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', userId: '1', userName: '张制片', role: 'owner', status: 'active', joinTime: '2023-06-01T00:00:00Z' },
        { id: '2', userId: '2', userName: '李导演', role: 'admin', status: 'active', joinTime: '2023-07-15T00:00:00Z' },
        { id: '3', userId: '3', userName: '王编剧', role: 'editor', status: 'active', joinTime: '2023-08-01T00:00:00Z' }
      ], 3)
  },
  {
    url: '/api/admin/teams/:teamId/invite-codes',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', code: 'INV-2024-A1B2C3', creatorName: '张制片', usageCount: 3, maxUsage: 10, status: 'active' },
        { id: '2', code: 'INV-2024-D4E5F6', creatorName: '李导演', usageCount: 1, maxUsage: 5, status: 'active' }
      ], 2)
  },
  {
    url: '/api/admin/teams/:teamId/invite-codes',
    method: 'post',
    response: () => successResponse({ id: '3', code: 'INV-ADMIN-NEW', usageCount: 0, maxUsage: 10, status: 'active' })
  },
  {
    url: '/api/admin/teams/:teamId/applications',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', userId: '10', userName: '新用户A', status: 'pending', applyTime: '2024-06-14T10:00:00Z' },
        { id: '2', userId: '11', userName: '新用户B', status: 'approved', applyTime: '2024-06-10T14:00:00Z' }
      ], 2)
  },
  {
    url: '/api/admin/members/:id/status',
    method: 'put',
    response: () => successResponse(null, '状态更新成功')
  },
  {
    url: '/api/admin/applications/:id/approve',
    method: 'put',
    response: () => successResponse(null, '审批通过')
  },
  {
    url: '/api/admin/applications/:id/reject',
    method: 'put',
    response: () => successResponse(null, '已拒绝')
  },
  {
    url: '/api/admin/invite-codes/:id',
    method: 'delete',
    response: () => successResponse(null, '邀请码已撤销')
  },

  // ==================== 管理 - 计费 ====================
  {
    url: '/api/admin/billing',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '基础版', price: 99, unit: '月', features: ['10个项目', '100次AI生成', '5GB存储'], status: 'active', userCount: 156 },
        { id: '2', name: '专业版', price: 299, unit: '月', features: ['50个项目', '500次AI生成', '20GB存储', '优先支持'], status: 'active', userCount: 89 },
        { id: '3', name: '企业版', price: 999, unit: '月', features: ['无限项目', '2000次AI生成', '100GB存储', '专属客服', 'API接入'], status: 'active', userCount: 23 },
        { id: '4', name: '按量计费-图片生成', price: 0.5, unit: '张', features: ['DALL-E 3', 'Stable Diffusion'], status: 'active', userCount: 234 },
        { id: '5', name: '按量计费-视频生成', price: 5, unit: '秒', features: ['Seedance 1.0', '最高1080p'], status: 'active', userCount: 178 }
      ])
  },
  {
    url: '/api/admin/billing',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '6', ...body, status: 'active', createdAt: new Date().toISOString() })
  },
  {
    url: '/api/admin/billing/:id',
    method: 'get',
    response: () =>
      successResponse({ id: '2', name: '专业版', price: 299, unit: '月', features: ['50个项目', '500次AI生成', '20GB存储', '优先支持'], status: 'active', userCount: 89 })
  },
  {
    url: '/api/admin/billing/:id',
    method: 'put',
    response: () => successResponse(null, '更新成功')
  },
  {
    url: '/api/admin/billing/:id/toggle',
    method: 'put',
    response: () => successResponse(null, '状态切换成功')
  },
  {
    url: '/api/admin/billing/:id/history',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', price: 299, effectiveTime: '2024-06-01T00:00:00Z', operator: 'Super' },
        { id: '2', price: 249, effectiveTime: '2024-03-01T00:00:00Z', operator: 'Super' },
        { id: '3', price: 199, effectiveTime: '2024-01-01T00:00:00Z', operator: 'Super' }
      ])
  },

  // ==================== 管理 - 配置 ====================
  {
    url: '/api/admin/config',
    method: 'get',
    response: () =>
      successResponse([
        { key: 'site.name', value: 'DreamCraft Astra', description: '站点名称', group: 'site', updatedAt: '2024-06-01T00:00:00Z' },
        { key: 'site.logo', value: '/logo.png', description: '站点Logo', group: 'site', updatedAt: '2024-01-01T00:00:00Z' },
        { key: 'upload.maxSize', value: '100', description: '上传文件最大大小(MB)', group: 'upload', updatedAt: '2024-03-15T00:00:00Z' },
        { key: 'ai.defaultModel', value: 'gpt-4', description: 'AI默认模型', group: 'ai', updatedAt: '2024-05-01T00:00:00Z' },
        { key: 'review.autoApprove', value: 'false', description: '审核自动通过', group: 'review', updatedAt: '2024-04-01T00:00:00Z' },
        { key: 'email.smtp', value: 'smtp.example.com', description: 'SMTP服务器', group: 'email', updatedAt: '2024-02-01T00:00:00Z' },
        { key: 'storage.provider', value: 'oss', description: '存储提供者', group: 'storage', updatedAt: '2024-01-15T00:00:00Z' },
        { key: 'security.sessionTimeout', value: '3600', description: '会话超时时间(秒)', group: 'security', updatedAt: '2024-06-10T00:00:00Z' }
      ])
  },
  {
    url: '/api/admin/config',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ ...body, createdAt: new Date().toISOString() })
  },
  {
    url: '/api/admin/config/:key',
    method: 'get',
    response: () =>
      successResponse({ key: 'site.name', value: 'DreamCraft Astra', description: '站点名称', group: 'site', updatedAt: '2024-06-01T00:00:00Z' })
  },
  {
    url: '/api/admin/config/:key',
    method: 'put',
    response: () => successResponse(null, '配置更新成功')
  },
  {
    url: '/api/admin/config/:key',
    method: 'delete',
    response: () => successResponse(null, '配置删除成功')
  },
  {
    url: '/api/admin/config/group/:groupName',
    method: 'get',
    response: () =>
      successResponse([
        { key: 'site.name', value: 'DreamCraft Astra', description: '站点名称', group: 'site' },
        { key: 'site.logo', value: '/logo.png', description: '站点Logo', group: 'site' }
      ])
  },
  {
    url: '/api/admin/config/audit',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', key: 'ai.defaultModel', oldValue: 'gpt-3.5', newValue: 'gpt-4', operator: 'Super', action: 'update', createdAt: '2024-06-10T14:30:00Z' },
        { id: '2', key: 'upload.maxSize', oldValue: '50', newValue: '100', operator: 'Super', action: 'update', createdAt: '2024-06-05T10:00:00Z' },
        { id: '3', key: 'security.sessionTimeout', oldValue: '1800', newValue: '3600', operator: 'Super', action: 'update', createdAt: '2024-05-20T16:00:00Z' },
        { id: '4', key: 'email.smtp', oldValue: '', newValue: 'smtp.example.com', operator: 'Super', action: 'create', createdAt: '2024-02-01T09:00:00Z' },
        { id: '5', key: 'test.config', oldValue: 'value', newValue: '', operator: 'Super', action: 'delete', createdAt: '2024-01-15T11:00:00Z' }
      ])
  },
  {
    url: '/api/admin/config/refresh',
    method: 'post',
    response: () => successResponse(null, '缓存刷新成功')
  },

  // ==================== 管理 - Dify工作流 ====================
  {
    url: '/api/admin/dify-workflows',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '剧本拆解工作流', code: 'script-decompose', description: '将剧本自动拆解为分集和场景', category: '剧本', status: 'active', difyAppId: 'app-001', lastTestTime: '2024-06-14T10:00:00Z' },
        { id: '2', name: '风格配置工作流', code: 'style-config', description: '根据参考图生成风格配置', category: '风格', status: 'active', difyAppId: 'app-002', lastTestTime: '2024-06-13T15:00:00Z' },
        { id: '3', name: '人物小传生成', code: 'character-profile', description: '根据剧本生成人物小传', category: '角色', status: 'active', difyAppId: 'app-003', lastTestTime: '2024-06-12T09:00:00Z' },
        { id: '4', name: '内容审核工作流', code: 'content-review', description: 'AI内容合规审核', category: '审核', status: 'active', difyAppId: 'app-004', lastTestTime: '2024-06-11T14:00:00Z' },
        { id: '5', name: '资产提取工作流', code: 'asset-extract', description: '从剧本提取资产清单', category: '资产', status: 'inactive', difyAppId: 'app-005', lastTestTime: '2024-06-10T11:00:00Z' }
      ])
  },
  {
    url: '/api/admin/dify-workflows',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '6', ...body, status: 'active', createdAt: new Date().toISOString() })
  },
  {
    url: '/api/admin/dify-workflows/:id',
    method: 'get',
    response: () =>
      successResponse({ id: '1', name: '剧本拆解工作流', code: 'script-decompose', description: '将剧本自动拆解为分集和场景', category: '剧本', status: 'active', difyAppId: 'app-001', difyApiUrl: 'https://api.dify.ai/v1', apiKey: '****', lastTestTime: '2024-06-14T10:00:00Z' })
  },
  {
    url: '/api/admin/dify-workflows/:id',
    method: 'put',
    response: () => successResponse(null, '更新成功')
  },
  {
    url: '/api/admin/dify-workflows/:id',
    method: 'delete',
    response: () => successResponse(null, '删除成功')
  },
  {
    url: '/api/admin/dify-workflows/:id/status',
    method: 'patch',
    response: () => successResponse(null, '状态切换成功')
  },
  {
    url: '/api/admin/dify-workflows/test-connection',
    method: 'post',
    response: () => successResponse({ success: true, latency: 120, message: '连接正常' })
  },
  {
    url: '/api/admin/dify-workflows/test-all-connections',
    method: 'post',
    response: () =>
      successResponse([
        { id: '1', name: '剧本拆解工作流', success: true, latency: 120 },
        { id: '2', name: '风格配置工作流', success: true, latency: 95 },
        { id: '3', name: '人物小传生成', success: true, latency: 150 },
        { id: '4', name: '内容审核工作流', success: false, error: '连接超时' },
        { id: '5', name: '资产提取工作流', success: true, latency: 110 }
      ])
  },

  // ==================== 管理 - 视频模型 ====================
  {
    url: '/api/admin/videos/models',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: 'Seedance 1.0', provider: 'ByteDance', status: 'active', pricing: 5, pricingUnit: '秒', maxDuration: 10, supportedResolutions: ['720p', '1080p'], description: '基础视频生成模型' },
        { id: '2', name: 'Seedance 1.5', provider: 'ByteDance', status: 'active', pricing: 8, pricingUnit: '秒', maxDuration: 15, supportedResolutions: ['720p', '1080p', '4K'], description: '高级视频生成模型，支持更长时长' },
        { id: '3', name: 'Runway Gen-3', provider: 'Runway', status: 'inactive', pricing: 12, pricingUnit: '秒', maxDuration: 10, supportedResolutions: ['720p', '1080p'], description: 'Runway最新视频生成模型' }
      ])
  },
  {
    url: '/api/admin/videos/models',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '4', ...body, status: 'active', createdAt: new Date().toISOString() })
  },
  {
    url: '/api/admin/videos/models/:id',
    method: 'put',
    response: () => successResponse(null, '更新成功')
  },
  {
    url: '/api/admin/videos/models/:id',
    method: 'delete',
    response: () => successResponse(null, '删除成功')
  },
  {
    url: '/api/admin/videos/models/:id/status',
    method: 'patch',
    response: () => successResponse(null, '状态切换成功')
  },

  // ==================== 积分 ====================
  {
    url: '/api/credits/me',
    method: 'get',
    response: () => successResponse({ total: 100000, used: 32000, remaining: 68000 })
  },
  {
    url: '/api/credits/transactions',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', date: '2024-06-15T10:00:00Z', amount: -500, type: 'spend', description: '图片生成 x10', balance: 68000 },
        { id: '2', date: '2024-06-14T15:00:00Z', amount: -2000, type: 'spend', description: '视频生成 x2', balance: 68500 },
        { id: '3', date: '2024-06-14T09:00:00Z', amount: -300, type: 'spend', description: '剧本分析', balance: 70500 },
        { id: '4', date: '2024-06-10T00:00:00Z', amount: 10000, type: 'earn', description: '月度充值', balance: 70800 },
        { id: '5', date: '2024-06-08T14:00:00Z', amount: -800, type: 'spend', description: '分镜拆解', balance: 60800 },
        { id: '6', date: '2024-06-05T10:00:00Z', amount: -1500, type: 'spend', description: '视频生成 x3', balance: 61600 },
        { id: '7', date: '2024-06-01T00:00:00Z', amount: 5000, type: 'earn', description: '系统赠送', balance: 63100 },
        { id: '8', date: '2024-05-28T16:00:00Z', amount: -600, type: 'spend', description: '人物小传生成', balance: 58100 },
        { id: '9', date: '2024-05-25T09:00:00Z', amount: -1200, type: 'spend', description: '内容审核', balance: 58700 },
        { id: '10', date: '2024-05-20T00:00:00Z', amount: 20000, type: 'earn', description: '充值', balance: 59900 }
      ], 10)
  },
  {
    url: '/api/credits/project/:projectId',
    method: 'get',
    response: () => successResponse({ total: 50000, used: 18000, remaining: 32000 })
  },
  {
    url: '/api/credits/pricing',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '图片生成(DALL-E 3)', price: 50, unit: '张', model: 'dall-e-3' },
        { id: '2', name: '图片生成(Stable Diffusion)', price: 10, unit: '张', model: 'stable-diffusion' },
        { id: '3', name: '视频生成(Seedance 1.0)', price: 500, unit: '秒', model: 'seedance-1.0' },
        { id: '4', name: '视频生成(Seedance 1.5)', price: 800, unit: '秒', model: 'seedance-1.5' },
        { id: '5', name: '剧本分析', price: 200, unit: '次', model: 'gpt-4' }
      ])
  },
  {
    url: '/api/token-usage/me',
    method: 'get',
    response: () =>
      successResponse({
        totalTokens: 1500000,
        byModel: [
          { model: 'gpt-4', tokens: 800000, calls: 520 },
          { model: 'dall-e-3', tokens: 0, calls: 380 },
          { model: 'seedance-1.0', tokens: 0, calls: 420 },
          { model: 'stable-diffusion', tokens: 0, calls: 200 }
        ]
      })
  },
  {
    url: '/api/token-usage/records',
    method: 'get',
    response: () =>
      paginatedResponse([
        { id: '1', date: '2024-06-15', model: 'gpt-4', tokens: 25000, calls: 15, cost: 500 },
        { id: '2', date: '2024-06-14', model: 'gpt-4', tokens: 30000, calls: 18, cost: 600 },
        { id: '3', date: '2024-06-13', model: 'dall-e-3', tokens: 0, calls: 20, cost: 1000 },
        { id: '4', date: '2024-06-12', model: 'seedance-1.0', tokens: 0, calls: 5, cost: 2500 },
        { id: '5', date: '2024-06-11', model: 'gpt-4', tokens: 20000, calls: 12, cost: 400 }
      ], 5)
  },
  {
    url: '/api/token-usage/project/:projectId',
    method: 'get',
    response: () =>
      successResponse({
        totalTokens: 800000,
        byModel: [
          { model: 'gpt-4', tokens: 400000, calls: 260 },
          { model: 'dall-e-3', tokens: 0, calls: 190 },
          { model: 'seedance-1.0', tokens: 0, calls: 210 }
        ]
      })
  },
  {
    url: '/api/token-usage/team/:teamId',
    method: 'get',
    response: () =>
      successResponse({
        totalTokens: 3000000,
        byModel: [
          { model: 'gpt-4', tokens: 1600000, calls: 1040 },
          { model: 'dall-e-3', tokens: 0, calls: 760 },
          { model: 'seedance-1.0', tokens: 0, calls: 840 },
          { model: 'stable-diffusion', tokens: 0, calls: 400 }
        ]
      })
  },

  // ==================== AI处理 ====================
  {
    url: '/api/ai-process/status',
    method: 'get',
    response: () => successResponse({ status: 'idle', currentTask: null })
  },
  {
    url: '/api/ai-process/history',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', type: 'decompose', targetName: '《重生厨神》第一集', status: 'completed', startTime: '2024-06-15T10:00:00Z', endTime: '2024-06-15T10:05:00Z', duration: '5分钟' },
        { id: '2', type: 'profile', targetName: '《重生厨神》角色', status: 'completed', startTime: '2024-06-15T09:30:00Z', endTime: '2024-06-15T09:38:00Z', duration: '8分钟' },
        { id: '3', type: 'extract', targetName: '《重生厨神》资产', status: 'completed', startTime: '2024-06-14T16:00:00Z', endTime: '2024-06-14T16:12:00Z', duration: '12分钟' },
        { id: '4', type: 'style', targetName: '《总裁甜妻》风格配置', status: 'completed', startTime: '2024-06-14T14:00:00Z', endTime: '2024-06-14T14:03:00Z', duration: '3分钟' },
        { id: '5', type: 'review', targetName: '《仙侠奇缘》内容审核', status: 'completed', startTime: '2024-06-13T15:00:00Z', endTime: '2024-06-13T15:08:00Z', duration: '8分钟' },
        { id: '6', type: 'voice', targetName: '《重生厨神》音色提示词', status: 'completed', startTime: '2024-06-13T10:00:00Z', endTime: '2024-06-13T10:06:00Z', duration: '6分钟' },
        { id: '7', type: 'decompose', targetName: '《萌宠大作战》第三集', status: 'failed', startTime: '2024-06-12T14:00:00Z', endTime: '2024-06-12T14:01:00Z', duration: '1分钟', error: 'API调用超时' },
        { id: '8', type: 'profile', targetName: '《都市修仙传》角色', status: 'completed', startTime: '2024-06-12T09:00:00Z', endTime: '2024-06-12T09:10:00Z', duration: '10分钟' }
      ])
  },
  {
    url: '/api/ai-process/history/:recordId',
    method: 'get',
    response: () =>
      successResponse({
        id: '1',
        type: 'decompose',
        targetName: '《重生厨神》第一集',
        status: 'completed',
        startTime: '2024-06-15T10:00:00Z',
        endTime: '2024-06-15T10:05:00Z',
        duration: '5分钟',
        input: { scriptId: '1', episodeId: '1' },
        output: { episodes: 3, scenes: 8, storyboards: 24 },
        logs: [
          { time: '2024-06-15T10:00:00Z', message: '开始处理剧本拆解' },
          { time: '2024-06-15T10:02:00Z', message: '场景识别完成，共8个场景' },
          { time: '2024-06-15T10:04:00Z', message: '分镜生成完成，共24个分镜' },
          { time: '2024-06-15T10:05:00Z', message: '处理完成' }
        ]
      })
  },

  // ==================== 数据历史 ====================
  {
    url: '/api/data-history',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', entityType: 'script', entityName: '《重生厨神》第一集', versionNumber: 3, changeType: 'update', operatorName: '王编剧', createdAt: '2024-06-15T10:00:00Z', description: '修改了第三幕剧情' },
        { id: '2', entityType: 'storyboard', entityName: 'SB-001 开场·山巅俯瞰', versionNumber: 2, changeType: 'update', operatorName: '刘美术', createdAt: '2024-06-14T16:00:00Z', description: '更新了分镜配图' },
        { id: '3', entityType: 'asset', entityName: '主角头像', versionNumber: 1, changeType: 'create', operatorName: '刘美术', createdAt: '2024-06-14T14:00:00Z', description: '上传角色立绘' },
        { id: '4', entityType: 'script', entityName: '《总裁甜妻》第二集', versionNumber: 2, changeType: 'update', operatorName: '周编剧', createdAt: '2024-06-13T15:00:00Z', description: '优化对话台词' },
        { id: '5', entityType: 'storyboard', entityName: 'SB-003 厨房初试身手', versionNumber: 1, changeType: 'create', operatorName: '刘美术', createdAt: '2024-06-13T10:00:00Z', description: '创建新分镜' },
        { id: '6', entityType: 'asset', entityName: '场景背景-厨房', versionNumber: 1, changeType: 'create', operatorName: '刘美术', createdAt: '2024-06-12T16:00:00Z', description: '上传场景素材' },
        { id: '7', entityType: 'script', entityName: '《仙侠奇缘》第一集', versionNumber: 5, changeType: 'update', operatorName: '王编剧', createdAt: '2024-06-12T10:00:00Z', description: '最终审核修改' },
        { id: '8', entityType: 'storyboard', entityName: 'SB-005 竹林追逐', versionNumber: 1, changeType: 'create', operatorName: '刘美术', createdAt: '2024-06-11T14:00:00Z', description: 'AI生成分镜初稿' }
      ])
  },
  {
    url: '/api/data-history/:historyId',
    method: 'get',
    response: () =>
      successResponse({
        id: '1',
        entityType: 'script',
        entityName: '《重生厨神》第一集',
        versionNumber: 3,
        changeType: 'update',
        operatorName: '王编剧',
        createdAt: '2024-06-15T10:00:00Z',
        description: '修改了第三幕剧情',
        diff: [
          { field: 'content', oldValue: '林小厨惊讶地看着眼前的景象...', newValue: '林小厨深吸一口气，环顾四周的古代厨房...' },
          { field: 'wordCount', oldValue: '4000', newValue: '4200' }
        ]
      })
  },
  {
    url: '/api/data-history/rollback',
    method: 'post',
    response: () => successResponse(null, '回滚成功')
  },

  // ==================== 剧本资产 ====================
  {
    url: '/api/projects/:id/script-assets',
    method: 'get',
    response: () =>
      successResponse([
        { id: '1', name: '林小厨', type: 'character', description: '现代厨师穿越到古代，乐观开朗', referenceImages: [], projectId: '1' },
        { id: '2', name: '御膳房', type: 'scene', description: '皇宫御膳房，金碧辉煌', referenceImages: [], projectId: '1' },
        { id: '3', name: '金菜刀', type: 'prop', description: '林小厨的传家宝，锋利无比', referenceImages: [], projectId: '1' },
        { id: '4', name: '厨师服', type: 'costume', description: '白色厨师服，绣有金色花纹', referenceImages: [], projectId: '1' },
        { id: '5', name: '小蝶', type: 'character', description: '宫女，善良温柔', referenceImages: [], projectId: '1' }
      ])
  },
  {
    url: '/api/projects/:id/script-assets',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: '6', ...body, createdAt: new Date().toISOString() })
  },
  {
    url: '/api/projects/:id/script-assets/batch',
    method: 'post',
    response: () => successResponse([{ id: '7' }, { id: '8' }])
  },
  {
    url: '/api/script-assets/:id',
    method: 'get',
    response: () =>
      successResponse({ id: '1', name: '林小厨', type: 'character', description: '现代厨师穿越到古代，乐观开朗', referenceImages: [], projectId: '1' })
  },
  {
    url: '/api/script-assets/:id',
    method: 'put',
    response: () => successResponse(null, '更新成功')
  },
  {
    url: '/api/script-assets/:id',
    method: 'delete',
    response: () => successResponse(null, '删除成功')
  },
  {
    url: '/api/script-assets/:id/upload-image',
    method: 'post',
    response: () => successResponse({ url: '' })
  },
  {
    url: '/api/projects/:id/scripts/:scriptId/assets/prompts',
    method: 'post',
    response: () => successResponse({ taskId: 'task-prompt-001', status: 'processing' })
  },
  {
    url: '/api/projects/:id/scripts/:scriptId/assets/images/generate',
    method: 'post',
    response: () => successResponse({ taskId: 'task-img-001', status: 'processing' })
  },
  {
    url: '/api/projects/:id/scripts/:scriptId/assets/images/review',
    method: 'post',
    response: () => successResponse(null, '审核提交成功')
  },

  // ==================== 通用上传 ====================
  {
    url: '/api/common/upload/wangeditor',
    method: 'post',
    response: () => successResponse({ url: '' })
  },

  // ==================== 审核模块 ====================
  {
    url: '/api/review/pending-count',
    method: 'get',
    response: () => successResponse(12)
  },
  {
    url: '/api/review/list',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: 1, title: '第二集分镜审核', description: '第二集"第一道招牌菜"全部分镜画面审核', type: 'storyboard', typeValue: '分镜审核', submitter: '王编剧', submitTime: '2024-06-15T10:30:00Z', priority: 'high', deadline: '2024-06-18T18:00:00Z' },
          { id: 2, title: '角色设定-林小厨', description: '主角林小厨的角色形象设定图审核', type: 'character', typeValue: '角色审核', submitter: '刘美术', submitTime: '2024-06-14T14:20:00Z', priority: 'high', deadline: '2024-06-17T18:00:00Z' },
          { id: 3, title: '第三集剧本审核', description: '第三集"宫廷美食大赛"剧本内容审核', type: 'script', typeValue: '剧本审核', submitter: '王编剧', submitTime: '2024-06-13T09:15:00Z', priority: 'medium', deadline: '2024-06-20T18:00:00Z' },
          { id: 4, title: '场景设定-御膳房', description: '御膳房场景概念图及氛围图审核', type: 'scene', typeValue: '场景审核', submitter: '刘美术', submitTime: '2024-06-12T16:45:00Z', priority: 'medium', deadline: '2024-06-19T18:00:00Z' },
          { id: 5, title: '第一集成片审核', description: '第一集完整成片输出审核', type: 'video', typeValue: '成片审核', submitter: '赵剪辑', submitTime: '2024-06-11T11:00:00Z', priority: 'high', deadline: '2024-06-14T18:00:00Z' },
          { id: 6, title: '角色设定-小蝶', description: '配角小蝶（宫女）的角色形象设定图审核', type: 'character', typeValue: '角色审核', submitter: '刘美术', submitTime: '2024-06-10T15:30:00Z', priority: 'low', deadline: '2024-06-20T18:00:00Z' },
          { id: 7, title: '第四集剧本审核', description: '第四集"御厨对决"剧本内容审核', type: 'script', typeValue: '剧本审核', submitter: '王编剧', submitTime: '2024-06-10T09:00:00Z', priority: 'medium', deadline: '2024-06-22T18:00:00Z' },
          { id: 8, title: '场景设定-竹林', description: '竹林场景概念图及氛围图审核', type: 'scene', typeValue: '场景审核', submitter: '刘美术', submitTime: '2024-06-09T13:20:00Z', priority: 'low', deadline: '2024-06-21T18:00:00Z' },
          { id: 9, title: '厨师服服装设定', description: '白色厨师服绣有金色花纹的服装设计稿审核', type: 'costume', typeValue: '服装审核', submitter: '刘美术', submitTime: '2024-06-09T10:10:00Z', priority: 'medium', deadline: '2024-06-18T18:00:00Z' },
          { id: 10, title: '第三集分镜审核', description: '第三集"宫廷美食大赛"分镜画面审核', type: 'storyboard', typeValue: '分镜审核', submitter: '王编剧', submitTime: '2024-06-08T16:00:00Z', priority: 'high', deadline: '2024-06-15T18:00:00Z' },
          { id: 11, title: '第二集成片审核', description: '第二集完整成片输出审核', type: 'video', typeValue: '成片审核', submitter: '赵剪辑', submitTime: '2024-06-07T14:30:00Z', priority: 'high', deadline: '2024-06-10T18:00:00Z' },
          { id: 12, title: '片头动画审核', description: '全剧片头动画效果审核', type: 'video', typeValue: '成片审核', submitter: '赵剪辑', submitTime: '2024-06-06T09:45:00Z', priority: 'medium', deadline: '2024-06-16T18:00:00Z' }
        ],
        12
      )
  },
  {
    url: '/api/review/items',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: 101, taskId: 1, contentUrl: '/uploads/storyboard/sb-002-img-01.jpg', contentType: 'image', status: 'pending', reviewer: '', reviewTime: '', comment: '' },
          { id: 102, taskId: 1, contentUrl: '/uploads/storyboard/sb-002-img-02.jpg', contentType: 'image', status: 'pending', reviewer: '', reviewTime: '', comment: '' },
          { id: 103, taskId: 1, contentUrl: '/uploads/storyboard/sb-002-img-03.jpg', contentType: 'image', status: 'approved', reviewer: '张制片', reviewTime: '2024-06-15T11:00:00Z', comment: '画面构图优秀' },
          { id: 104, taskId: 2, contentUrl: '/uploads/characters/lin-xiaochu-front.jpg', contentType: 'image', status: 'pending', reviewer: '', reviewTime: '', comment: '' },
          { id: 105, taskId: 2, contentUrl: '/uploads/characters/lin-xiaochu-side.jpg', contentType: 'image', status: 'pending', reviewer: '', reviewTime: '', comment: '' },
          { id: 106, taskId: 3, contentUrl: '/uploads/scripts/episode-03.txt', contentType: 'text', status: 'approved', reviewer: '张制片', reviewTime: '2024-06-13T15:30:00Z', comment: '剧情节奏把握得当' },
          { id: 107, taskId: 4, contentUrl: '/uploads/scenes/kitchen-concept.jpg', contentType: 'image', status: 'rejected', reviewer: '张制片', reviewTime: '2024-06-12T17:20:00Z', comment: '色调偏冷，需调整为暖色调' },
          { id: 108, taskId: 5, contentUrl: '/uploads/videos/episode-01-final.mp4', contentType: 'video', status: 'pending', reviewer: '', reviewTime: '', comment: '' },
          { id: 109, taskId: 6, contentUrl: '/uploads/characters/xiaodie-front.jpg', contentType: 'image', status: 'pending', reviewer: '', reviewTime: '', comment: '' },
          { id: 110, taskId: 7, contentUrl: '/uploads/scripts/episode-04.txt', contentType: 'text', status: 'pending', reviewer: '', reviewTime: '', comment: '' }
        ],
        10
      )
  },
  {
    url: '/api/review/detail/:id',
    method: 'get',
    response: () =>
      successResponse({
        id: 1, title: '第二集分镜审核', description: '第二集"第一道招牌菜"全部分镜画面审核', type: 'storyboard', typeValue: '分镜审核', submitter: '王编剧', submitTime: '2024-06-15T10:30:00Z', priority: 'high', deadline: '2024-06-18T18:00:00Z'
      })
  },
  {
    url: '/api/review/create',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: 100, ...body, submitTime: new Date().toISOString(), priority: 'medium', deadline: '' }, '审核任务创建成功')
  },
  {
    url: '/api/review/:id/claim',
    method: 'post',
    response: () => successResponse(null, '认领成功')
  },
  {
    url: '/api/review/decision',
    method: 'post',
    response: () => successResponse(null, '审核决定已提交')
  },
  {
    url: '/api/review/batch-decision',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) => {
      const taskIds = (body.taskIds as number[]) || []
      return successResponse({ successCount: taskIds.length, failCount: 0, failures: [] })
    }
  },
  {
    url: '/api/review/:id/withdraw',
    method: 'post',
    response: () => successResponse(null, '审核已撤回')
  },
  {
    url: '/api/review/:id/archive',
    method: 'post',
    response: () => successResponse(null, '归档成功')
  },
  {
    url: '/api/review/:id/dispatch',
    method: 'post',
    response: () => successResponse(null, '成果已下发')
  },
  {
    url: '/api/review/status/:reviewType/:targetId',
    method: 'get',
    response: () =>
      successResponse({ reviewType: 'storyboard', targetId: '1', status: 'pending', currentStep: 1, reviewer: '张制片' })
  },
  {
    url: '/api/review/my-submissions',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: 3, title: '第三集剧本审核', description: '第三集"宫廷美食大赛"剧本内容审核', type: 'script', typeValue: '剧本审核', submitter: '王编剧', submitTime: '2024-06-13T09:15:00Z', priority: 'medium', deadline: '2024-06-20T18:00:00Z' },
          { id: 7, title: '第四集剧本审核', description: '第四集"御厨对决"剧本内容审核', type: 'script', typeValue: '剧本审核', submitter: '王编剧', submitTime: '2024-06-10T09:00:00Z', priority: 'medium', deadline: '2024-06-22T18:00:00Z' },
          { id: 1, title: '第二集分镜审核', description: '第二集"第一道招牌菜"全部分镜画面审核', type: 'storyboard', typeValue: '分镜审核', submitter: '王编剧', submitTime: '2024-06-15T10:30:00Z', priority: 'high', deadline: '2024-06-18T18:00:00Z' },
          { id: 10, title: '第三集分镜审核', description: '第三集"宫廷美食大赛"分镜画面审核', type: 'storyboard', typeValue: '分镜审核', submitter: '王编剧', submitTime: '2024-06-08T16:00:00Z', priority: 'high', deadline: '2024-06-15T18:00:00Z' }
        ],
        4
      )
  },
  {
    url: '/api/review/projects/:projectId/statistics',
    method: 'get',
    response: () =>
      successResponse({ total: 48, pending: 12, approved: 28, rejected: 8 })
  },
  {
    url: '/api/review/projects/:projectId/export',
    method: 'post',
    response: () => successResponse(null, '导出任务已创建')
  },
  {
    url: '/api/review/projects/:projectId/reject-reasons',
    method: 'get',
    response: () =>
      successResponse([
        { id: 1, content: '画面质量不达标，细节模糊', category: '质量', applicableTypes: ['storyboard', 'character', 'scene'], usageCount: 15, sort: 1, enabled: true, createTime: '2024-01-15T10:00:00Z' },
        { id: 2, content: '角色形象与设定不符', category: '一致性', applicableTypes: ['character', 'costume'], usageCount: 8, sort: 2, enabled: true, createTime: '2024-01-15T10:05:00Z' },
        { id: 3, content: '色调与整体风格不统一', category: '风格', applicableTypes: ['scene', 'storyboard'], usageCount: 12, sort: 3, enabled: true, createTime: '2024-02-01T14:00:00Z' },
        { id: 4, content: '剧情逻辑存在矛盾', category: '内容', applicableTypes: ['script'], usageCount: 5, sort: 4, enabled: true, createTime: '2024-02-10T09:30:00Z' },
        { id: 5, content: '镜头语言表达不清晰', category: '内容', applicableTypes: ['storyboard'], usageCount: 10, sort: 5, enabled: true, createTime: '2024-03-05T11:20:00Z' },
        { id: 6, content: '音频质量不合格，有杂音', category: '质量', applicableTypes: ['video'], usageCount: 3, sort: 6, enabled: true, createTime: '2024-03-20T16:00:00Z' },
        { id: 7, content: '时长不符合要求', category: '规范', applicableTypes: ['video'], usageCount: 7, sort: 7, enabled: true, createTime: '2024-04-01T08:45:00Z' },
        { id: 8, content: '场景布局不合理，透视错误', category: '一致性', applicableTypes: ['scene', 'storyboard'], usageCount: 6, sort: 8, enabled: false, createTime: '2024-04-15T13:10:00Z' }
      ])
  },
  {
    url: '/api/review/projects/:projectId/reject-reasons',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: 9, ...body, usageCount: 0, createTime: new Date().toISOString() }, '驳回原因添加成功')
  },
  {
    url: '/api/review/projects/:projectId/reject-reasons/:reasonId',
    method: 'delete',
    response: () => successResponse(null, '驳回原因已删除')
  },
  {
    url: '/api/review/projects/:projectId/route-config',
    method: 'get',
    response: () =>
      successResponse({
        flows: [
          {
            id: 1, name: '分镜审核流程', createTime: '2024-01-10T10:00:00Z', status: 'active', activeStep: 1,
            steps: [
              { name: '提交审核', approver: '提交人', time: '2024-06-15T10:30:00Z' },
              { name: '美术审核', approver: '刘美术', time: '' },
              { name: '导演审核', approver: '李导演', time: '' },
              { name: '制片终审', approver: '张制片', time: '' }
            ],
            approverList: [
              { name: '刘美术', done: false, current: true },
              { name: '李导演', done: false, current: false },
              { name: '张制片', done: false, current: false }
            ]
          },
          {
            id: 2, name: '剧本审核流程', createTime: '2024-01-10T10:05:00Z', status: 'active', activeStep: 2,
            steps: [
              { name: '提交审核', approver: '提交人', time: '2024-06-13T09:15:00Z' },
              { name: '编剧组长审核', approver: '王编剧', time: '2024-06-13T14:00:00Z' },
              { name: '导演审核', approver: '李导演', time: '' },
              { name: '制片终审', approver: '张制片', time: '' }
            ],
            approverList: [
              { name: '王编剧', done: true, current: false },
              { name: '李导演', done: false, current: true },
              { name: '张制片', done: false, current: false }
            ]
          },
          {
            id: 3, name: '成片审核流程', createTime: '2024-01-10T10:10:00Z', status: 'active', activeStep: 0,
            steps: [
              { name: '提交审核', approver: '提交人', time: '' },
              { name: '剪辑组长审核', approver: '赵剪辑', time: '' },
              { name: '导演审核', approver: '李导演', time: '' },
              { name: '制片终审', approver: '张制片', time: '' }
            ],
            approverList: [
              { name: '赵剪辑', done: false, current: true },
              { name: '李导演', done: false, current: false },
              { name: '张制片', done: false, current: false }
            ]
          }
        ]
      })
  },
  {
    url: '/api/review/projects/:projectId/route-config',
    method: 'put',
    response: () => successResponse(null, '审核路由配置更新成功')
  },

  // ==================== 通知模块 ====================
  {
    url: '/api/notifications',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: '1', title: '第二集分镜已提交审核', content: '王编剧提交了第二集"第一道招牌菜"的分镜审核申请，共5张分镜画面待审核。', type: 'review', status: 'unread', starred: false, sender: '系统通知', senderAvatar: '', createTime: '2024-06-15T10:30:00Z' },
          { id: '2', title: '角色设定审核已通过', content: '您提交的"林小厨"角色设定图已通过审核，审核人：张制片。', type: 'review', status: 'unread', starred: true, sender: '审核通知', senderAvatar: '', createTime: '2024-06-14T16:20:00Z' },
          { id: '3', title: '项目进度更新：68%', content: '项目《重生之我在古代当厨神》整体进度已更新为68%，其中分镜完成度75%，角色设定完成度90%。', type: 'project', status: 'read', starred: false, sender: '项目通知', senderAvatar: '', createTime: '2024-06-14T09:00:00Z' },
          { id: '4', title: '新成员赵剪辑加入团队', content: '赵剪辑已通过邀请码加入"创意工作室"团队，角色为编辑者。', type: 'team', status: 'read', starred: false, sender: '团队通知', senderAvatar: '', createTime: '2024-06-13T14:15:00Z' },
          { id: '5', title: '场景设定审核已驳回，请修改', content: '您提交的"御膳房"场景设定已被驳回，原因：色调偏冷，需调整为暖色调以符合古装宫廷氛围。', type: 'review', status: 'unread', starred: false, sender: '审核通知', senderAvatar: '', createTime: '2024-06-12T11:45:00Z' },
          { id: '6', title: '积分余额不足，请及时充值', content: '您的积分余额已不足100点，当前余额：85点。建议及时充值以免影响AI生成服务的使用。', type: 'system', status: 'read', starred: false, sender: '系统通知', senderAvatar: '', createTime: '2024-06-11T08:30:00Z' },
          { id: '7', title: '第三集剧本审核通过', content: '第三集"宫廷美食大赛"剧本已通过全部审核流程，可以进行分镜拆解。', type: 'review', status: 'read', starred: true, sender: '审核通知', senderAvatar: '', createTime: '2024-06-10T17:00:00Z' },
          { id: '8', title: 'AI图片生成完成', content: '您提交的"林小厨角色正面图"AI生成任务已完成，共生成4张图片，请前往查看。', type: 'ai', status: 'unread', starred: false, sender: 'AI通知', senderAvatar: '', createTime: '2024-06-10T15:20:00Z' },
          { id: '9', title: '团队周报已生成', content: '创意工作室本周工作周报已自动生成：完成分镜12张、角色设定3个、场景设定2个。', type: 'team', status: 'read', starred: false, sender: '团队通知', senderAvatar: '', createTime: '2024-06-09T18:00:00Z' },
          { id: '10', title: '系统维护通知', content: '系统将于6月20日凌晨2:00-4:00进行例行维护升级，届时服务将暂时不可用，请提前保存工作。', type: 'system', status: 'unread', starred: false, sender: '系统通知', senderAvatar: '', createTime: '2024-06-09T10:00:00Z' }
        ],
        10
      )
  },
  {
    url: '/api/notifications/unread-count',
    method: 'get',
    response: () => successResponse(4)
  },
  {
    url: '/api/notifications/:id',
    method: 'get',
    response: () =>
      successResponse({
        id: '1', title: '第二集分镜已提交审核', content: '王编剧提交了第二集"第一道招牌菜"的分镜审核申请，共5张分镜画面待审核。', type: 'review', status: 'unread', starred: false, sender: '系统通知', senderAvatar: '', createTime: '2024-06-15T10:30:00Z'
      })
  },
  {
    url: '/api/notifications/:id/read',
    method: 'post',
    response: () => successResponse(null, '标记已读成功')
  },
  {
    url: '/api/notifications/:id/unread',
    method: 'post',
    response: () => successResponse(null, '标记未读成功')
  },
  {
    url: '/api/notifications/read-all',
    method: 'post',
    response: () => successResponse(null, '全部标记已读成功')
  },
  {
    url: '/api/notifications/batch-read',
    method: 'post',
    response: () => successResponse(null, '批量标记已读成功')
  },
  {
    url: '/api/notifications/:id',
    method: 'delete',
    response: () => successResponse(null, '通知已删除')
  },
  {
    url: '/api/notifications/batch-delete',
    method: 'delete',
    response: () => successResponse(null, '批量删除成功')
  },
  {
    url: '/api/notifications/clear-read',
    method: 'post',
    response: () => successResponse(null, '已读通知已清空')
  },
  {
    url: '/api/notifications/:id/star',
    method: 'post',
    response: () => successResponse(null, '收藏成功')
  },
  {
    url: '/api/notifications/starred',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: '2', title: '角色设定审核已通过', content: '您提交的"林小厨"角色设定图已通过审核，审核人：张制片。', type: 'review', status: 'unread', starred: true, sender: '审核通知', senderAvatar: '', createTime: '2024-06-14T16:20:00Z' },
          { id: '7', title: '第三集剧本审核通过', content: '第三集"宫廷美食大赛"剧本已通过全部审核流程，可以进行分镜拆解。', type: 'review', status: 'read', starred: true, sender: '审核通知', senderAvatar: '', createTime: '2024-06-10T17:00:00Z' }
        ],
        2
      )
  },
  {
    url: '/api/notifications/search',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: '1', title: '第二集分镜已提交审核', content: '王编剧提交了第二集"第一道招牌菜"的分镜审核申请', type: 'review', status: 'unread', starred: false, sender: '系统通知', senderAvatar: '', createTime: '2024-06-15T10:30:00Z' },
          { id: '5', title: '场景设定审核已驳回，请修改', content: '您提交的"御膳房"场景设定已被驳回', type: 'review', status: 'unread', starred: false, sender: '审核通知', senderAvatar: '', createTime: '2024-06-12T11:45:00Z' }
        ],
        2
      )
  },
  {
    url: '/api/notifications/export',
    method: 'get',
    response: () => successResponse(null, '导出任务已创建')
  },
  {
    url: '/api/notifications/preference',
    method: 'get',
    response: () =>
      successResponse({
        emailEnabled: true,
        browserEnabled: true,
        types: [
          { type: 'review', enabled: true },
          { type: 'project', enabled: true },
          { type: 'team', enabled: true },
          { type: 'system', enabled: true },
          { type: 'ai', enabled: false }
        ]
      })
  },
  {
    url: '/api/notifications/preference',
    method: 'put',
    response: () => successResponse(null, '通知偏好更新成功')
  },
  {
    url: '/api/notifications/dnd',
    method: 'get',
    response: () =>
      successResponse({ enabled: false, startTime: '22:00', endTime: '08:00', timezone: 'Asia/Shanghai' })
  },
  {
    url: '/api/notifications/dnd',
    method: 'put',
    response: () => successResponse(null, '免打扰设置更新成功')
  },
  {
    url: '/api/notifications/subscribe',
    method: 'get',
    response: () =>
      successResponse([
        { id: 'sub-1', type: 'review', name: '审核结果通知', enabled: true },
        { id: 'sub-2', type: 'project', name: '项目进度通知', enabled: true },
        { id: 'sub-3', type: 'team', name: '团队动态通知', enabled: true },
        { id: 'sub-4', type: 'system', name: '系统公告通知', enabled: true },
        { id: 'sub-5', type: 'ai', name: 'AI任务通知', enabled: false },
        { id: 'sub-6', type: 'billing', name: '计费提醒通知', enabled: true }
      ])
  },
  {
    url: '/api/notifications/subscribe',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: 'sub-7', ...body, enabled: true }, '订阅添加成功')
  },
  {
    url: '/api/notifications/subscribe/:id',
    method: 'delete',
    response: () => successResponse(null, '订阅已取消')
  },
  {
    url: '/api/notifications/ws-token',
    method: 'post',
    response: () => successResponse('ws-token-mock-' + Date.now())
  },

  // ==================== 工作流模块 ====================
  {
    url: '/api/dify-workflows/catalog',
    method: 'get',
    response: () =>
      successResponse([
        { code: 'script-decompose', name: '剧本拆解', description: '将剧本自动拆解为分集、场景、角色等结构化数据', category: '剧本处理' },
        { code: 'storyboard-generate', name: '分镜生成', description: '基于剧本内容自动生成分镜画面描述和构图建议', category: '分镜处理' },
        { code: 'character-design', name: '角色设计', description: '根据角色描述自动生成角色形象设计图', category: '角色处理' },
        { code: 'scene-design', name: '场景设计', description: '根据场景描述自动生成场景概念图和氛围图', category: '场景处理' },
        { code: 'style-inference', name: '风格反推', description: '上传参考图，自动反推艺术风格和配色方案', category: '风格分析' },
        { code: 'voice-synthesis', name: '配音生成', description: '基于角色台词和音色描述自动生成配音音频', category: '音频处理' },
        { code: 'video-compose', name: '视频合成', description: '将分镜画面、配音、特效合成为完整视频', category: '视频处理' },
        { code: 'content-review', name: '内容审核', description: '自动审核剧本、图片、视频内容是否合规', category: '内容安全' },
        { code: 'prompt-optimize', name: '提示词优化', description: '优化用户输入的AI提示词，提升生成效果', category: 'AI辅助' },
        { code: 'asset-extract', name: '资产提取', description: '从剧本中自动提取角色、场景、道具等资产信息', category: '剧本处理' }
      ])
  },
  {
    url: '/api/dify-workflows/:workflowCode/upload-file',
    method: 'post',
    response: () =>
      successResponse({ fileId: 'file-' + Date.now(), fileName: 'upload.jpg', fileUrl: '/uploads/temp/upload.jpg' })
  },
  {
    url: '/api/dify-workflows/:workflowCode/execute',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'task-' + Date.now(),
        status: 'completed',
        outputs: { result: '工作流执行完成', data: {} }
      })
  },
  {
    url: '/api/dify-workflows/runs/:workflowCode/:taskId/stop',
    method: 'post',
    response: () => successResponse(null, '工作流已停止')
  },
  {
    url: '/api/dify-workflows/runs/:workflowCode/:runId',
    method: 'get',
    response: () =>
      successResponse({ runId: 'run-' + Date.now(), status: 'completed', outputs: { result: '执行结果数据' } })
  },
  {
    url: '/api/dify-workflows/multimodal/execute',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'mm-task-' + Date.now(),
        status: 'completed',
        outputs: { result: '多模态执行完成', images: [], text: '' }
      })
  },
  {
    url: '/api/dify-workflows/multimodal/execute-chain',
    method: 'post',
    response: () =>
      successResponse({
        taskId: 'chain-task-' + Date.now(),
        status: 'completed',
        outputs: { result: '链式执行完成', steps: [] }
      })
  },
  {
    url: '/api/ai/style-inference',
    method: 'post',
    response: () =>
      successResponse({
        style: '日系动漫风格',
        prompt: 'anime style, warm color palette, detailed background, soft lighting, cel shading',
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],
        composition: '中心构图，人物居中，背景虚化处理',
        lighting: '柔和自然光，暖色调侧光，营造温馨氛围'
      })
  },

  // ==================== 剪辑编辑器模块 ====================
  {
    url: '/api/edit/projects',
    method: 'get',
    response: () =>
      paginatedResponse(
        [
          { id: 'ep-1', name: '第一集-穿越了？我是厨神？', description: '第一集完整剪辑项目', status: 'editing', duration: 900, segmentCount: 8, createBy: '1', createdBy: '1', creatorName: '赵剪辑', createTime: '2024-06-01T10:00:00Z', updateTime: '2024-06-15T16:30:00Z', projectId: '1', projectName: '《重生之我在古代当厨神》', editName: '第一集初剪', resolution: '1920x1080', frameRate: 24, durationSeconds: 900 },
          { id: 'ep-2', name: '第二集-第一道招牌菜', description: '第二集完整剪辑项目', status: 'editing', duration: 870, segmentCount: 7, createBy: '1', createdBy: '1', creatorName: '赵剪辑', createTime: '2024-06-05T14:00:00Z', updateTime: '2024-06-14T11:20:00Z', projectId: '1', projectName: '《重生之我在古代当厨神》', editName: '第二集初剪', resolution: '1920x1080', frameRate: 24, durationSeconds: 870 },
          { id: 'ep-3', name: '第三集-宫廷美食大赛', description: '第三集剪辑项目，剧本审核中', status: 'draft', duration: 0, segmentCount: 0, createBy: '1', createdBy: '1', creatorName: '赵剪辑', createTime: '2024-06-10T09:00:00Z', updateTime: '2024-06-10T09:00:00Z', projectId: '1', projectName: '《重生之我在古代当厨神》', editName: '第三集草稿', resolution: '1920x1080', frameRate: 24, durationSeconds: 0 },
          { id: 'ep-4', name: '片头动画', description: '全剧片头动画剪辑', status: 'completed', duration: 30, segmentCount: 3, createBy: '1', createdBy: '1', creatorName: '赵剪辑', createTime: '2024-05-20T10:00:00Z', updateTime: '2024-06-08T17:00:00Z', projectId: '1', projectName: '《重生之我在古代当厨神》', editName: '片头终剪', resolution: '1920x1080', frameRate: 24, durationSeconds: 30 },
          { id: 'ep-5', name: '《总裁的契约甜妻》第一集', description: '总裁甜妻第一集剪辑', status: 'editing', duration: 720, segmentCount: 6, createBy: '2', createdBy: '2', creatorName: '李导演', createTime: '2024-06-08T13:00:00Z', updateTime: '2024-06-13T15:45:00Z', projectId: '2', projectName: '《总裁的契约甜妻》', editName: '第一集精剪', resolution: '1920x1080', frameRate: 24, durationSeconds: 720 }
        ],
        5
      )
  },
  {
    url: '/api/edit/projects/:projectId',
    method: 'get',
    response: () =>
      successResponse({
        id: 'ep-1', name: '第一集-穿越了？我是厨神？', description: '第一集完整剪辑项目', status: 'editing', duration: 900, segmentCount: 8, createBy: '1', createdBy: '1', creatorName: '赵剪辑', createTime: '2024-06-01T10:00:00Z', updateTime: '2024-06-15T16:30:00Z', projectId: '1', projectName: '《重生之我在古代当厨神》', editName: '第一集初剪', resolution: '1920x1080', frameRate: 24, durationSeconds: 900,
        segments: [
          { id: 'seg-1', projectId: 'ep-1', type: 'video', sourceUrl: '/uploads/video/ep01-scene01.mp4', startTime: 0, endTime: 120, duration: 120, sortOrder: 1, metadata: { scene: '现代厨房', description: '林小厨在厨房做菜' } },
          { id: 'seg-2', projectId: 'ep-1', type: 'video', sourceUrl: '/uploads/video/ep01-scene02.mp4', startTime: 120, endTime: 250, duration: 130, sortOrder: 2, metadata: { scene: '穿越瞬间', description: '林小厨意外穿越' } },
          { id: 'seg-3', projectId: 'ep-1', type: 'video', sourceUrl: '/uploads/video/ep01-scene03.mp4', startTime: 250, endTime: 400, duration: 150, sortOrder: 3, metadata: { scene: '古代山间', description: '林小厨在古代醒来' } },
          { id: 'seg-4', projectId: 'ep-1', type: 'audio', sourceUrl: '/uploads/audio/ep01-bgm-01.mp3', startTime: 0, endTime: 250, duration: 250, sortOrder: 4, metadata: { type: 'bgm', description: '开场背景音乐' } },
          { id: 'seg-5', projectId: 'ep-1', type: 'video', sourceUrl: '/uploads/video/ep01-scene04.mp4', startTime: 400, endTime: 550, duration: 150, sortOrder: 5, metadata: { scene: '御膳房', description: '林小厨初到御膳房' } },
          { id: 'seg-6', projectId: 'ep-1', type: 'video', sourceUrl: '/uploads/video/ep01-scene05.mp4', startTime: 550, endTime: 720, duration: 170, sortOrder: 6, metadata: { scene: '厨艺展示', description: '林小厨展示厨艺' } },
          { id: 'seg-7', projectId: 'ep-1', type: 'audio', sourceUrl: '/uploads/audio/ep01-bgm-02.mp3', startTime: 400, endTime: 720, duration: 320, sortOrder: 7, metadata: { type: 'bgm', description: '高潮背景音乐' } },
          { id: 'seg-8', projectId: 'ep-1', type: 'video', sourceUrl: '/uploads/video/ep01-ending.mp4', startTime: 720, endTime: 900, duration: 180, sortOrder: 8, metadata: { scene: '结尾', description: '第一集结尾' } }
        ]
      })
  },
  {
    url: '/api/edit/projects',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: 'ep-new', ...body, status: 'draft', duration: 0, segmentCount: 0, createTime: new Date().toISOString(), updateTime: new Date().toISOString() }, '剪辑项目创建成功')
  },
  {
    url: '/api/edit/projects/:projectId',
    method: 'put',
    response: () => successResponse(null, '剪辑项目更新成功')
  },
  {
    url: '/api/edit/projects/:projectId',
    method: 'delete',
    response: () => successResponse(null, '剪辑项目已删除')
  },
  {
    url: '/api/edit/projects/:projectId/segments',
    method: 'post',
    response: ({ body }: { body: Record<string, unknown> }) =>
      successResponse({ id: 'seg-new', projectId: 'ep-1', ...body, sortOrder: 9 }, '片段添加成功')
  },
  {
    url: '/api/edit/projects/:projectId/segments/:segmentId',
    method: 'put',
    response: () => successResponse(null, '片段更新成功')
  },
  {
    url: '/api/edit/projects/:projectId/segments/:segmentId',
    method: 'delete',
    response: () => successResponse(null, '片段已删除')
  },
  {
    url: '/api/edit/projects/:projectId/segments/reorder',
    method: 'put',
    response: () => successResponse(null, '片段排序已更新')
  },
  {
    url: '/api/edit/projects/:projectId/export',
    method: 'post',
    response: () =>
      successResponse({
        id: 'export-' + Date.now(), projectId: 'ep-1', status: 'queued', progress: 0, downloadUrl: '', createTime: new Date().toISOString(), completeTime: ''
      }, '导出任务已创建')
  },
  {
    url: '/api/edit/exports/:exportId',
    method: 'get',
    response: () =>
      successResponse({
        id: 'export-001', projectId: 'ep-1', status: 'completed', progress: 100, downloadUrl: '/uploads/exports/ep01-final.mp4', createTime: '2024-06-15T17:00:00Z', completeTime: '2024-06-15T17:15:00Z'
      })
  },

  // ==================== 图片模型详情 ====================
  {
    url: '/api/gpt-image/models/:modelCode',
    method: 'get',
    response: () =>
      successResponse({ code: 'gpt-image-1', name: 'GPT Image 1', description: '高质量AI图片生成模型，支持多种风格和尺寸', enabled: true })
  }
] as MockMethod[]
