<!-- 团队成员贡献排行模块 -->
<template>
  <div class="art-card p-5 mb-5 team-ranking-card">
    <div class="team-ranking-header">
      <div class="team-ranking-title">
        <h4>团队贡献榜</h4>
        <p>本月活跃成员 Top 排名</p>
      </div>
      <ArtSvgIcon icon="ri:trophy-line" class="trophy-icon" />
    </div>

    <div class="ranking-list">
      <ElScrollbar v-if="rankingList.length">
        <div v-for="(item, index) in rankingList" :key="item.userId" class="ranking-item">
          <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
          <ElAvatar :size="36" :src="item.avatar" class="rank-avatar">
            {{ item.userName?.charAt(0) }}
          </ElAvatar>
          <div class="rank-info">
            <div class="rank-name">{{ item.userName }}</div>
            <div class="rank-meta">活跃 {{ item.activeDays }} 天</div>
          </div>
          <div class="rank-score">
            <ArtCountTo
              :target="item.contributionScore ?? 0"
              :duration="1000"
              class="rank-score-value"
            />
            <span class="rank-score-label">分</span>
          </div>
        </div>
      </ElScrollbar>
      <div v-else class="ranking-empty">
        <ArtSvgIcon icon="ri:user-search-line" class="empty-icon" />
        <p>暂无团队成员数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserActivityRank } from '@/api/queries'

  defineOptions({ name: 'TeamRanking' })

  // 统一数据层：用户活跃度排行
  const { data: activityRank } = useUserActivityRank()

  // 取 Top 8
  const rankingList = computed(() => {
    const list = (activityRank.value as Api.Statistics.UserActivityRankItem[] | null) || []
    return [...list]
      .sort((a, b) => (b.contributionScore ?? 0) - (a.contributionScore ?? 0))
      .slice(0, 8)
  })
</script>

<style lang="scss" scoped>
  .team-ranking-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 18rem;
    display: flex;
    flex-direction: column;
  }

  .team-ranking-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .team-ranking-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .team-ranking-title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .trophy-icon {
    font-size: 20px;
    color: var(--art-warning);
  }

  .ranking-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid var(--art-gray-200);

    &:last-child {
      border-bottom: none;
    }
  }

  .rank-badge {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: var(--art-gray-200);
    color: var(--art-gray-700);
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rank-1 {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #fff;
  }

  .rank-2 {
    background: linear-gradient(135deg, #cbd5e1, #94a3b8);
    color: #fff;
  }

  .rank-3 {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #fff;
  }

  .rank-avatar {
    background: var(--art-primary);
    color: #fff;
    font-weight: 600;
    flex-shrink: 0;
  }

  .rank-info {
    flex: 1;
    min-width: 0;
  }

  .rank-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--art-gray-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-meta {
    margin-top: 1px;
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .rank-score {
    display: flex;
    align-items: baseline;
    gap: 2px;
    flex-shrink: 0;
  }

  .rank-score-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .rank-score-label {
    font-size: 10px;
    color: var(--art-gray-500);
  }

  .ranking-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 0;
    color: var(--art-gray-400);

    p {
      margin: 0;
      font-size: 12px;
    }
  }

  .empty-icon {
    font-size: 28px;
  }
</style>
