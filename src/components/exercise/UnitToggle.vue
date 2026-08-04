<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggle">
    <span
      >날씨단위: <b>{{ configStore.unit }}</b></span
    >
    <button class="toggle-btn" @click="configStore.toggleUnit()">단위변경</button>
  </div>
</template>
