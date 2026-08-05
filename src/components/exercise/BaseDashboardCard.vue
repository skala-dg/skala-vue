<script setup>
defineProps({
  glass: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <el-card
    shadow="never"
    class="base-dashboard-card"
    :class="{ 'base-dashboard-card--glass': glass }"
  >
    <slot></slot>
  </el-card>
</template>

<style scoped src="../../assets/styles/components/base-dashboard-card.css"></style>
