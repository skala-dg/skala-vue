<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggle from './components/exercise/UnitToggle.vue'
</script>

<template>
  <el-container class="app-shell">
    <el-header class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand" aria-label="날씨 대시보드 홈">
          <span class="brand-mark">W</span>
          <span class="brand-text">
            <strong>Weatherly</strong>
            <small>City Weather Dashboard</small>
          </span>
        </RouterLink>

        <nav class="main-nav" aria-label="주요 메뉴">
          <RouterLink to="/" class="nav-link">대시보드</RouterLink>
          <RouterLink to="/about" class="nav-link">서비스 소개</RouterLink>
        </nav>

        <UnitToggle />
      </div>
    </el-header>

    <el-main class="app-main">
      <RouterView />
    </el-main>

    <el-footer class="app-footer">
      <span>Weatherly</span>
      <span>OpenWeather 기반 도시 날씨 서비스</span>
    </el-footer>
  </el-container>
</template>

<style scoped src="./assets/styles/app.css"></style>
