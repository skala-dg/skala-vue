<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const handleUnitChange = (nextUnit) => {
  if (nextUnit !== configStore.unit) {
    configStore.toggleUnit()
  }
}
</script>

<template>
  <div class="unit-toggle" aria-label="온도 단위 선택">
    <span class="unit-label">단위</span>

    <el-radio-group
      :model-value="configStore.unit"
      size="small"
      class="unit-group"
      @change="handleUnitChange"
    >
      <el-radio-button label="celsius">°C</el-radio-button>
      <el-radio-button label="fahrenheit">°F</el-radio-button>
    </el-radio-group>
  </div>
</template>

<style scoped src="../../assets/styles/components/unit-toggle.css"></style>
