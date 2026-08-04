<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div style="padding: 20px">
    <h1>과제 4: 라우터 적용</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </div>
  <RouterView></RouterView>
</template>

<style scoped></style>
