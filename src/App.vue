<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggle from './components/exercise/UnitToggle.vue'
</script>

<template>
  <el-container class="app-shell">
    <el-header class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand" aria-label="날씨 대시보드 홈">
          <span class="brand-mark">S</span>
          <span class="brand-text">
            <strong>SKALA Weather</strong>
            <small>City Weather Dashboard</small>
          </span>
        </RouterLink>

        <nav class="main-nav" aria-label="주요 메뉴">
          <RouterLink to="/">날씨 대시보드</RouterLink>

          <RouterLink to="/korea"> 한국 중기예보 </RouterLink>

          <RouterLink to="/about"> 서비스 소개 </RouterLink>
        </nav>

        <UnitToggle />
      </div>
    </el-header>

    <el-main class="app-main">
      <RouterView />
    </el-main>

    <el-footer class="app-footer">
      <span>SKALA Weather</span>
      <span>판교 9반 P301 임동건</span>
    </el-footer>
  </el-container>
</template>

<style scoped src="./assets/styles/app.css"></style>
