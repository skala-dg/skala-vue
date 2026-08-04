<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const route = useRoute()
const cityItem = weatherList.value.find((city) => city.id === route.params.cityId)
</script>

<template>
  <div class="weather-detail"></div>
  <h2>지역별 상게 기상 관측 정보</h2>
  <BaseDashboardCard>
    <p>지정 지역 {{ cityItem.name }}</p>
    <p>
      온도:
      {{ configStore.unit === 'celsius' ? cityItem.temp : Math.round(cityItem.temp * 18 + 320) / 10
      }}{{ configStore.unitSymbol }}
    </p>
    <p>상태: {{ cityItem.status }}</p>
  </BaseDashboardCard>
</template>
