<script setup>
import { ref } from 'vue'
const searchInput = ref('')
const selectedCity = ref('카드를 클릭하거나 검색해 보세요.')
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-mockup">
    <h2 class="weather-title">과제 1: 날씨 (Mockup)</h2>
    <br />
    <hr />
    <section class="search-box">
      <h3>도시 검색</h3>
      <input
        type="text"
        :value="searchInput"
        @input="(e) => (searchInput = e.target.value)"
        placeholder="검색할 도시 이름 입력"
      />
      <p>
        검색 중인 도시: <b>{{ searchInput }}</b>
      </p>
    </section>

    <section class="weather-box">
      <h3>지역별 날씨 현황</h3>
      <div
        v-for="item in weatherList"
        :key="item.id"
        class="weather-card"
        @click="selectedCity = `${item.name}을 선택하였습니다.`"
      >
        <h4>{{ item.name }} ({{ item.status }})</h4>
        <p>현재 기온: {{ item.temp }}</p>

        <span v-if="item.temp >= 25" class="hot-icon">더움 (25도 이상)</span>
        <span v-else class="cold-icon">시원함 (25도 미만)</span>

        <button class="detail-btn" @click.stop="showDetail(item.name, item.status)">
          상세보기
        </button>
      </div>
    </section>

    <div class="status-bar">{{ selectedCity }}</div>
  </div>
</template>

<style scoped></style>
