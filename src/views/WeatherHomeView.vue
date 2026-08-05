<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { searchByChosung } from '@/components/utils/koreaninput.js'
import { useAPI } from '@/components/utils/apiHandler.js'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()
const { weatherList, isLoading, errorMsg, addCity, refreshCity, refreshAllCity } = useAPI()

// 검색어
const searchQuery = ref('')
// 선택된 도시
const selectedCityInfo = ref('카드를 선택하면 현재 상태를 확인할 수 있습니다.')
// 도시 추가 Dialog 표시 여부
const isAddFormOpen = ref(false)
// 새로 추가할 도시
const newCityName = ref('')

const cityCount = computed(() => weatherList.value.length)

// 상세보기 클릭 시 View 이동
const showDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}

// 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링(초성 검색 가능)
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
  ElMessage.success(`${city.name}의 날씨가 목록에 반영되었습니다.`)
  closeAddForm()
}

const handleRefreshCity = async (cityId) => {
  const city = await refreshCity(cityId)

  if (city) {
    selectedCityInfo.value = `${city.name}의 날씨를 갱신했습니다.`
    ElMessage.success(`${city.name}의 최신 날씨를 불러왔습니다.`)
  }
}

const handleRefreshAll = async () => {
  const updatedList = await refreshAllCity()

  if (updatedList) {
    selectedCityInfo.value = '모든 도시의 날씨를 갱신했습니다.'
    ElMessage.success('등록된 모든 도시의 날씨를 갱신했습니다.')
  }
}

// selectedCityInfo 감시: 상태바 문구가 바뀔 때마다 콘솔로그를 작성
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch 감시] 상태 바 문구가 업데이트되었습니다.\n${oldValue} --> ${newValue}`)
})

// searchQuery 감시: 도시 검색어를 타이핑할 때마다 변하는 searchQuery를 추적
watchEffect(() => {
  console.log(`[watchEffect 자동 호출] 현재 검색어: ${searchQuery.value}`)
})
</script>

<template>
  <section class="weather-home">
    <header class="hero-panel">
      <div class="hero-copy">
        <span class="hero-eyebrow">LIVE CITY WEATHER</span>
        <h1>도시의 지금을<br />한눈에 확인하세요.</h1>
        <p>
          등록된 도시의 현재 기온과 날씨 상태를 확인하고, 필요한 순간 최신 정보로 간편하게 갱신할 수
          있습니다.
        </p>
      </div>

      <div class="hero-summary">
        <span>등록 도시</span>
        <strong>{{ cityCount }}</strong>
        <small>개 도시를 관리 중입니다.</small>
      </div>
    </header>

    <BaseDashboardCard glass class="control-panel">
      <SearchBar :current-query="searchQuery" @query="searchQuery = $event" />

      <div class="weather-actions">
        <el-button type="primary" size="large" round @click="openAddForm"> 도시 추가 </el-button>

        <el-button
          size="large"
          round
          plain
          :loading="isLoading"
          :disabled="weatherList.length === 0"
          @click="handleRefreshAll"
        >
          전체 날씨 갱신
        </el-button>
      </div>
    </BaseDashboardCard>

    <el-alert
      v-if="errorMsg"
      class="page-alert"
      :title="errorMsg"
      type="error"
      show-icon
      :closable="false"
    />

    <section
      v-loading="isLoading"
      element-loading-text="날씨 정보를 불러오는 중입니다."
      class="weather-grid-section"
    >
      <div class="section-heading">
        <div>
          <span class="section-eyebrow">YOUR CITIES</span>
          <h2>지역별 날씨 현황</h2>
        </div>
        <span class="result-count">{{ filteredWeatherList.length }}개 결과</span>
      </div>

      <el-row v-if="filteredWeatherList.length > 0" :gutter="20" class="weather-grid">
        <el-col
          v-for="item in filteredWeatherList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :lg="8"
          class="weather-column"
        >
          <WeatherCard
            :city-item="item"
            @selected-name="selectedCityInfo = `${$event}을 선택하셨습니다.`"
            @selected-detail="showDetail"
            @refresh-weather="handleRefreshCity"
          />
        </el-col>
      </el-row>

      <BaseDashboardCard v-else glass class="empty-card">
        <el-empty description="검색 결과와 일치하는 도시가 없습니다.">
          <el-button type="primary" plain round @click="searchQuery = ''">
            검색어 초기화
          </el-button>
        </el-empty>
      </BaseDashboardCard>
    </section>

    <el-alert
      class="status-bar"
      :title="
        filteredWeatherList.length === 0
          ? '다른 도시 이름이나 초성으로 검색해보세요.'
          : selectedCityInfo
      "
      type="info"
      :closable="false"
      show-icon
    />

    <el-dialog
      v-model="isAddFormOpen"
      title="새 도시 추가"
      width="min(92vw, 460px)"
      align-center
      class="add-city-dialog"
      @closed="closeAddForm"
    >
      <p class="dialog-description">
        도시 이름을 입력하면 위치를 검색한 뒤 현재 날씨까지 한 번에 추가합니다.
      </p>

      <el-form @submit.prevent="handleAddCity">
        <el-form-item label="도시 이름">
          <el-input
            v-model="newCityName"
            size="large"
            clearable
            autofocus
            placeholder="예: Seoul, Busan, Tokyo"
            :disabled="isLoading"
            @keyup.enter="handleAddCity"
          />
        </el-form-item>
      </el-form>

      <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon :closable="false" />

      <template #footer>
        <el-button round :disabled="isLoading" @click="closeAddForm">취소</el-button>
        <el-button
          type="primary"
          round
          :loading="isLoading"
          :disabled="!newCityName.trim()"
          @click="handleAddCity"
        >
          도시 추가
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped src="../assets/styles/views/weather-home.css"></style>
