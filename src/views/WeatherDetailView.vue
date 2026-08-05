<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useConfigStore } from '@/stores/configStore'
import { useAPI } from '@/components/utils/apiHandler'
const configStore = useConfigStore()
// const weatherList = ref([
//   { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
//   { id: 'city_02', name: '수원', temp: 24, status: '비' },
//   { id: 'city_03', name: '부산', temp: 26, status: '구름' },
// ])

const { weatherList, isLoading, errorMsg, refreshCity } = useAPI()
const route = useRoute()
//const cityItem = weatherList.value.find((city) => city.id === route.params.cityId)
const cityItem = computed(() =>
  weatherList.value.find((city) => String(city.id) === String(route.params.cityId)),
)
const convertTemp = (temp) => {
  const rawTemp = temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const displayTemp = computed(() => convertTemp(cityItem.value?.temp))
const displayFeelsLike = computed(() => convertTemp(cityItem.value?.feelsLike))

const displayMaxTemp = computed(() => convertTemp(cityItem.value?.tempMax))
const displayMinTemp = computed(() => convertTemp(cityItem.value?.tempMin))
const handleRefresh = async () => {
  if (!cityItem.value) return
  await refreshCity(cityItem.value.id)
}
const iconUrl = computed(() => {
  if (!cityItem.value?.icon) {
    return ''
  }

  return `https://openweathermap.org/payload/api/media/file/${cityItem.value.icon}.png`
})
</script>

<template>
  <div class="weather-detail"></div>
  <h2>지역별 상계 기상 관측 정보</h2>
  <BaseDashboardCard>
    <div class="detail-city-title">
      <p>지정 지역 {{ cityItem.name }}</p>

      <img
        v-if="iconUrl"
        :src="iconUrl"
        :alt="`${cityItem.name} ${cityItem.status} 날씨 아이콘`"
        class="detail-weather-icon"
      />
    </div>
    <p>
      온도:
      {{ displayTemp }}{{ configStore.unitSymbol }}
    </p>
    <p>상태: {{ cityItem.status }}</p>
    <p>
      최고 기온:
      {{ displayMaxTemp }}{{ configStore.unitSymbol }}
    </p>
    <p>
      최저 기온:
      {{ displayMinTemp }}{{ configStore.unitSymbol }}
    </p>
    <p>
      체감 온도:
      {{ displayFeelsLike }}{{ configStore.unitSymbol }}
    </p>
    <p>습도: {{ cityItem.humidity }}%</p>

    <button type="button" :disabled="isLoading" @click="handleRefresh">
      {{ isLoading ? '갱신 중...' : '현재 날씨 갱신' }}
    </button>

    <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>
  </BaseDashboardCard>
</template>
<style scoped>
.detail-city-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-city-title h2 {
  margin: 0;
}

.detail-weather-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
</style>
