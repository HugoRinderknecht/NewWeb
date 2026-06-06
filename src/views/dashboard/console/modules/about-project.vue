<!-- 关于项目模块 -->
<template>
  <div class="art-card about-project-card">
    <div class="about-content">
      <h2 class="about-title">关于 {{ systemName }}</h2>
      <p class="about-desc"> {{ systemName }} 是一款兼具设计美学与高效开发的后台系统 </p>
      <p class="about-desc">使用了 Vue3、TypeScript、Vite、Element Plus 等前沿技术</p>

      <div class="about-links">
        <div
          v-for="link in linkList"
          :key="link.label"
          class="about-link-item"
          @click="goPage(link.url)"
        >
          <span class="link-label">{{ link.label }}</span>
          <ArtSvgIcon icon="ri:arrow-right-s-line" class="link-arrow" />
        </div>
      </div>
    </div>
    <img class="about-illustration" src="@imgs/draw/draw1.png" alt="draw1" />
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { WEB_LINKS } from '@/utils/constants'

  defineOptions({ name: 'AboutProject' })

  const systemName = AppConfig.systemInfo.name

  const linkList = [
    { label: '项目官网', url: WEB_LINKS.DOCS },
    { label: '文档', url: WEB_LINKS.INTRODUCE },
    { label: 'Github', url: WEB_LINKS.GITHUB_HOME },
    { label: '哔哩哔哩', url: WEB_LINKS.BILIBILI }
  ]

  /**
   * 在新标签页中打开指定 URL
   * @param url 要打开的网页地址
   */
  const goPage = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
</script>

<style lang="scss" scoped>
  .about-project-card {
    box-sizing: border-box;
    padding: 22px 24px;
    margin-bottom: 16px;
    height: 18rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    overflow: hidden;
  }

  .about-content {
    flex: 1;
    min-width: 0;
  }

  .about-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .about-desc {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--art-gray-700);
  }

  .about-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
    max-width: 480px;
  }

  .about-link-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 180px;
    height: 40px;
    padding: 0 12px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-gray-300);
    border-radius: 8px;
    color: var(--art-gray-700);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      background: var(--default-box-color);
      border-color: var(--art-primary);
      color: var(--art-primary);
      transform: translateY(-1px);
    }
  }

  .link-label {
    flex: 1;
  }

  .link-arrow {
    font-size: 16px;
    color: var(--art-gray-500);
    transition: color 0.2s;
  }

  .about-link-item:hover .link-arrow {
    color: var(--art-primary);
  }

  .about-illustration {
    width: 200px;
    max-width: 100%;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .about-project-card {
      flex-direction: column;
      align-items: flex-start;
      height: auto;
    }

    .about-illustration {
      display: none;
    }
  }
</style>
