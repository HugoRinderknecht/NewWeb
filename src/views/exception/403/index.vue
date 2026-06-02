<!-- 403页面 -->
<template>
  <ArtException
    :data="{
      title: '403',
      desc: '抱歉，您没有权限访问此页面',
      btnText: '返回首页',
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/svg/403.svg'
  defineOptions({ name: 'Exception403' })
</script>
