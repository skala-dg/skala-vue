<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
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
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
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
  <div class="weather-mockup">
    <h2 class="weather-title">과제 2: 날씨 (컴포지션)</h2>
    <br />
    <hr />
    <section class="search-box">
      <h3>도시 검색</h3>
      <input
        type="text"
        :value="searchQuery"
        @input="(e) => (searchQuery = e.target.value)"
        placeholder="검색할 도시 이름 입력"
      />
      <p>
        검색 중인 도시: <b>{{ searchQuery }}</b>
      </p>
    </section>

    <section class="weather-box">
      <h3>지역별 날씨 현황</h3>
      <div
        v-for="item in filteredWeatherList"
        :key="item.id"
        class="weather-card"
        @click="selectedCityInfo = `${item.name}을 선택하였습니다.`"
      >
        <h4>{{ item.name }} ({{ item.status }})</h4>
        <p>현재 기온: {{ item.temp }}</p>

        <span v-if="item.temp >= 25" class="hot-icon">더움 (25도 이상)</span>
        <span v-else class="cold-icon">시원함 (25도 미만)</span>

        <button class="detail-btn" @click.stop="showDetail(item.name, item.status)">
          상세보기
        </button>
      </div>

      <p v-if="filteredWeatherList.length === 0" class="empty-meesage">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
    </section>

    <div v-if="filteredWeatherList.length === 0" class="empty-status-bar">
      다른 도시를 검색해보세요.
    </div>
    <div v-else class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped></style>
