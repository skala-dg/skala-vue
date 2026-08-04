<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const route = useRoute()
const cityInfo = weatherList.value.find((city) => city.id === route.params.cityId)
</script>

<template>
  <div class="weather-detail"></div>
  <h2>지역별 상게 기상 관측 정보</h2>
  <BaseDashboardCard>
    <p>지정 지역 {{ cityInfo.name }}</p>
    <p>온도: {{ cityInfo.temp }}</p>
    <p>상태: {{ cityInfo.status }}</p>
  </BaseDashboardCard>
</template>
