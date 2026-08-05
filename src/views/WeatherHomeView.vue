<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { searchByChosung } from '@/components/utils/koreaninput.js'
import { useAPI } from '@/components/utils/apiHandler.js'
// 자식 컴포넌트 import

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()
const { weatherList, isLoading, errorMsg, addCity, refreshCity, refreshAllCity } = useAPI()
// 검색어
const searchQuery = ref('')
// 선택된 도시
const selectedCityInfo = ref('카드를 클릭해 보세요.')
// 도시 추가 입력창 표시 여부
const isAddFormOpen = ref(false)
// 새로 추가할 도시
const newCityName = ref('')
// 지역별 날씨 데이터 배열
//const weatherList = ref([
//  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
//  { id: 'city_02', name: '수원', temp: 24, status: '비' },
//  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
//])
// 상세보기 클릭시 view 이동
const showDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}
// 검색 도시: 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링(초성 검색 가능)
const filteredWeatherList = computed(() => {
  return weatherList.value.filter((city) => searchByChosung(searchQuery.value, city.name))
})

const openAddForm = () => {
  errorMsg.value = ''
  isAddFormOpen.value = true
}

const closeAddForm = () => {
  newCityName.value = ''
  errorMsg.value = ''
  isAddFormOpen.value = false
}

const handleAddCity = async () => {
  const city = await addCity(newCityName.value)

  if (!city) return

  selectedCityInfo.value = `${city.name}의 날씨를 추가했습니다.`
  newCityName.value = ''
  isAddFormOpen.value = false
}

const handleRefreshCity = async (cityId) => {
  const city = await refreshCity(cityId)

  if (city) {
    selectedCityInfo.value = `${city.name}의 날씨를 갱신했습니다.`
  }
}

const handleRefreshAll = async () => {
  const updatedList = await refreshAllCity()

  if (updatedList) {
    selectedCityInfo.value = '모든 도시의 날씨를 갱신했습니다.'
  }
}

// SelectedCityInfo 감시: 상태바 문구가 바뀔때 마다 콘솔로그를 작성
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch 감시] 상태 바 문구가 업데이트되었습니다.\n${oldValue} --> ${newValue}`)
})
// searchQuery 감시: 도시 검색어를 타이핑할 때 마다 변하는 searchQuery를 추적하여 콘솔로그로 작성
watchEffect(() => {
  console.log(`[watchEffect 자동 호출] 현재 검색어: ${searchQuery.value}`)
})
</script>

<template>
  <div class="weather-home">
    <BaseDashboardCard
      ><SearchBar :current-query="searchQuery" @query="(val) => (searchQuery = val)"></SearchBar>
      <div class="weather-actions">
        <button v-if="!isAddFormOpen" type="button" @click="openAddForm">도시 추가</button>

        <button
          type="button"
          :disabled="isLoading || weatherList.length === 0"
          @click="handleRefreshAll"
        >
          {{ isLoading ? '갱신 중...' : '전체 날씨 갱신' }}
        </button>
      </div>

      <form v-if="isAddFormOpen" class="add-city-form" @submit.prevent="handleAddCity">
        <input
          v-model="newCityName"
          type="text"
          placeholder="추가할 도시 이름을 입력하세요"
          :disabled="isLoading"
        />
        <button type="submit" :disabled="isLoading || !newCityName.trim()">
          {{ isLoading ? '검색 중...' : '추가' }}
        </button>
        <button type="submit" :disabled="isLoading" @click="closeAddForm">취소</button>
      </form>
      <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>
    </BaseDashboardCard>
    <BaseDashboardCard
      ><WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @selected-name="(name) => (selectedCityInfo = `${name}을 선택하셨습니다.`)"
        @selected-detail="showDetail"
        @refresh-weather="handleRefreshCity"
      ></WeatherCard>
      <p v-if="filteredWeatherList.length === 0" class="empty-meesage">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>
    <div v-if="filteredWeatherList.length === 0" class="empty-status-bar">
      다른 도시를 검색해보세요.
    </div>
    <div v-else class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped></style>
