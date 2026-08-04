<script setup>
defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['selected-name', 'selected-detail'])
</script>
<template>
  <div class="weather-box" @click="emit('selected-name', cityItem.name)">
    <h3>지역별 날씨 현황</h3>
    <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>
    <p>현재 기온: {{ cityItem.temp }}</p>

    <span v-if="cityItem.temp >= 25" class="hot-icon">더움 (25도 이상)</span>
    <span v-else class="cold-icon">시원함 (25도 미만)</span>

    <button class="detail-btn" @click.stop="emit('selected-detail', cityItem.id)">상세보기</button>
  </div>
</template>
<style scoped></style>
