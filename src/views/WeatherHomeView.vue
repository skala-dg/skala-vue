<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
// 자식 컴포넌트 import
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()
// 검색어
const searchQuery = ref('')
// 선택된 도시
const selectedCityInfo = ref('카드를 클릭해 보세요.')
// 지역별 날씨 데이터 배열
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])
// 상세보기 클릭시
const showDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}
// 검색 도시: 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링
const filteredWeatherList = computed(() => {
  const input = searchQuery.value.trim()

  if (input === '') {
    return weatherList.value
  }
  return weatherList.value.filter((item) => item.name.includes(input))
})
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
      ><SearchBar :current-query="searchQuery" @query="(val) => (searchQuery = val)"></SearchBar
    ></BaseDashboardCard>
    <BaseDashboardCard
      ><WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @selected-name="(name) => (selectedCityInfo = `${name}을 선택하셨습니다.`)"
        @selected-detail="showDetail"
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
