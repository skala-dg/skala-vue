<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchByChosung } from '@/components/utils/koreaninput.js'
import { useAPI } from '@/components/utils/apiHandler.js'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()
const {
  weatherList,
  isLoading,
  errorMsg,
  initializeWeatherList,
  addCity,
  refreshCity,
  refreshAllCity,
  reorderCard,
  removeCity,
  toggleFavorite,
} = useAPI()

// 검색어
const searchQuery = ref('')

// 즐겨찾기 도시만 표시 여부
const showFavoritesOnly = ref(false)
// 드래그 된 도시
const draggedCityId = ref(null)
// 선택된 도시
const selectedCityInfo = ref('카드를 선택하면 현재 상태를 확인할 수 있습니다.')
// 도시 추가 Dialog 표시 여부
const isAddFormOpen = ref(false)
// 새로 추가할 도시
const newCityName = ref('')

const cityCount = computed(() => weatherList.value.length)

// 첫 방문
onMounted(() => {
  initializeWeatherList()
})
// 상세보기 클릭 시 View 이동
const showDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}

// 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링(초성 검색 가능)
// 즐겨찾기 조건 추가
const filteredWeatherList = computed(() => {
  return weatherList.value.filter((city) => {
    const matchesSearch = searchByChosung(searchQuery.value, city.name)

    const matchesFavorite = !showFavoritesOnly.value || city.isFavorite === true

    return matchesSearch && matchesFavorite
  })
})
// 도시 추가창 열기
const openAddForm = () => {
  errorMsg.value = ''
  isAddFormOpen.value = true
}
// 도시 추가창 닫기
const closeAddForm = () => {
  newCityName.value = ''
  errorMsg.value = ''
  isAddFormOpen.value = false
}
// 도시 추가 함수
const handleAddCity = async () => {
  const city = await addCity(newCityName.value)

  if (!city) return

  selectedCityInfo.value = `${city.name}의 날씨를 추가했습니다.`
  ElMessage.success(`${city.name}의 날씨가 목록에 반영되었습니다.`)
  closeAddForm()
}
// 도시 날씨 갱신
const handleRefreshCity = async (cityId) => {
  const city = await refreshCity(cityId)

  if (city) {
    selectedCityInfo.value = `${city.name}의 날씨를 갱신했습니다.`
    ElMessage.success(`${city.name}의 최신 날씨를 불러왔습니다.`)
  }
}
// 모든 도시 날씨 갱신
const handleRefreshAll = async () => {
  const updatedList = await refreshAllCity()

  if (updatedList) {
    selectedCityInfo.value = '모든 도시의 날씨를 갱신했습니다.'
    ElMessage.success('등록된 모든 도시의 날씨를 갱신했습니다.')
  }
}

// 즐겨찾기 함수
const handleToggleFavorite = (cityId) => {
  const city = toggleFavorite(cityId)

  if (!city) {
    ElMessage.error('즐겨찾기를 변경할 도시를 찾지 못했습니다.')
    return
  }

  if (city.isFavorite) {
    selectedCityInfo.value = `"${city.name}" 도시를 즐겨찾기에 추가했습니다.`
    ElMessage.success(`${city.name}을 즐겨찾기에 추가했습니다.`)
  } else {
    selectedCityInfo.value = `"${city.name}" 도시를 즐겨찾기에서 해제했습니다.`
    ElMessage.info(`${city.name}을 즐겨찾기에서 해제했습니다.`)
  }
}
// 즐겨찾기
const favoriteCityCount = computed(() => {
  return weatherList.value.filter((city) => city.isFavorite === true).length
})
// 즐겨찾기만 보기 함수
const toggleFavoriteView = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value

  if (showFavoritesOnly.value) {
    selectedCityInfo.value = `즐겨찾기 도시 ${favoriteCityCount.value}개를 표시하고 있습니다.`
  } else {
    selectedCityInfo.value = '등록된 전체 도시를 표시하고 있습니다.'
  }
}

const emptyDescription = computed(() => {
  const hasSearchQuery = searchQuery.value.trim() !== ''

  if (showFavoritesOnly.value && hasSearchQuery) {
    return '즐겨찾기 도시 중 검색 결과와 일치하는 도시가 없습니다.'
  }

  if (showFavoritesOnly.value) {
    return '즐겨찾기한 도시가 없습니다.'
  }

  return '검색 결과와 일치하는 도시가 없습니다.'
})
// 카드 삭제 함수
const handleRemoveCity = async (cityId) => {
  const city = weatherList.value.find((item) => item.id === cityId)

  if (!city) {
    ElMessage.error('삭제할 도시를 찾지 못했습니다.')
    return
  }

  try {
    await ElMessageBox.confirm(`"${city.name}" 도시를 목록에서 삭제하시겠습니까?`, '도시 삭제', {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      type: 'warning',
    })
  } catch {
    return
  }

  const removedCity = removeCity(cityId)

  if (!removedCity) {
    ElMessage.error('도시를 삭제하지 못했습니다.')
    return
  }

  selectedCityInfo.value = `"${removedCity.name}" 도시를 목록에서 삭제했습니다.`
  ElMessage.success(`${removedCity.name}을 삭제했습니다.`)
}

// 검색 중 또는 즐겨찾기 보기 땐 카드 순서 변경 금지
const isDragEnabled = computed(() => {
  return searchQuery.value.trim() === '' && !showFavoritesOnly.value
})

// 카드 드래그 시작
const handleCardDragStart = (cityId, event) => {
  if (!isDragEnabled.value) {
    event.preventDefault()
    return
  }

  if (!Number.isInteger(cityId)) {
    event.preventDefault()
    return
  }

  if (!event.dataTransfer) {
    event.preventDefault()
    return
  }

  draggedCityId.value = cityId
  // 드래그 선언
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(cityId))
}

// 다른 카드 위치에 내려놓았을 때
const handleCardDrop = (targetCityId) => {
  if (draggedCityId.value === null) {
    return
  }

  if (!Number.isInteger(targetCityId)) {
    draggedCityId.value = null
    return
  }

  const sourceCityId = draggedCityId.value

  const oldIndex = weatherList.value.findIndex((city) => city.id === sourceCityId)

  const newIndex = weatherList.value.findIndex((city) => city.id === targetCityId)

  if (oldIndex !== -1 && newIndex !== -1) {
    reorderCard(oldIndex, newIndex)
  }

  draggedCityId.value = null
}

// 카드 드래그 종료
const handleCardDragEnd = () => {
  draggedCityId.value = null
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
        <h1>도시의 날씨를<br />한눈에 확인하세요.</h1>
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
        <!-- 즐겨찾기 필터 -->
        <el-button
          class="favorite-filter-button"
          size="large"
          round
          :type="showFavoritesOnly ? 'warning' : ''"
          :plain="!showFavoritesOnly"
          @click="toggleFavoriteView"
        >
          {{ showFavoritesOnly ? '전체 보기' : `즐겨찾기 (${favoriteCityCount})` }}
        </el-button>

        <!-- 추가 갱신 -->
        <div class="weather-action-group">
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
          <div
            class="weather-card-drop-zone"
            @dragenter.prevent
            @dragover.prevent
            @drop.prevent="handleCardDrop(item.id)"
          >
            <WeatherCard
              :city-item="item"
              :drag-enabled="isDragEnabled"
              @drag-start="handleCardDragStart"
              @drag-end="handleCardDragEnd"
              @selected-name="selectedCityInfo = `${$event}을 선택하셨습니다.`"
              @selected-detail="showDetail"
              @refresh-weather="handleRefreshCity"
              @toggle-favorite="handleToggleFavorite"
              @remove-city="handleRemoveCity"
            />
          </div>
        </el-col>
      </el-row>

      <BaseDashboardCard v-else glass class="empty-card">
        <el-empty :description="emptyDescription">
          <!-- 검색어 때문에 결과가 없다면 검색어 초기화 -->
          <el-button v-if="searchQuery.trim()" type="primary" plain round @click="searchQuery = ''">
            검색어 초기화
          </el-button>

          <!-- 즐겨찾기 도시가 없다면 전체 목록으로 이동 -->
          <el-button
            v-else-if="showFavoritesOnly"
            type="primary"
            plain
            round
            @click="showFavoritesOnly = false"
          >
            전체 도시 보기
          </el-button>
        </el-empty>
      </BaseDashboardCard>
    </section>

    <el-alert
      class="status-bar"
      :title="filteredWeatherList.length === 0 ? emptyDescription : selectedCityInfo"
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
            placeholder="예: 서울, 울산, 뉴욕, 도쿄"
            :disabled="isLoading"
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
