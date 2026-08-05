<script setup>
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },

  dragEnabled: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'selected-name',
  'selected-detail',
  'refresh-weather',
  'drag-start',
  'drag-end',
  'toggle-favorite',
  'remove-city',
])

const convertTemp = (temp) => {
  if (temp === null || temp === undefined) return '-'

  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  return Math.round(temp)
}

const displayTemp = computed(() => convertTemp(props.cityItem.temp))
const displayFeelsLike = computed(() => convertTemp(props.cityItem.feelsLike))
const displayMaxTemp = computed(() => convertTemp(props.cityItem.tempMax))
const displayMinTemp = computed(() => convertTemp(props.cityItem.tempMin))
const isDragging = ref(false)
const iconUrl = computed(() => {
  if (!props.cityItem.icon) return ''

  return `https://openweathermap.org/payload/api/media/file/${props.cityItem.icon}.png`
})

const weatherToneClass = computed(() => {
  const weatherMain = (
    props.cityItem.weatherMain ??
    props.cityItem.weather_main ??
    ''
  ).toLowerCase()

  if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
    return 'weather-card--rain'
  }

  if (weatherMain.includes('cloud')) {
    return 'weather-card--cloud'
  }

  if (weatherMain.includes('snow')) {
    return 'weather-card--snow'
  }

  return 'weather-card--clear'
})

const comfortTag = computed(() => {
  if (props.cityItem.temp >= 25) {
    return { label: '더움', type: 'danger' }
  }

  return { label: '선선함', type: 'success' }
})

const formattedUpdatedAt = computed(() => {
  if (!props.cityItem.updatedAt) return '갱신 시각 정보 없음'

  const rawTimestamp = Number(props.cityItem.updatedAt)
  const timestamp = rawTimestamp < 100000000000 ? rawTimestamp * 1000 : rawTimestamp
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return String(props.cityItem.updatedAt)
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})

const handleDragStart = (event) => {
  if (!props.dragEnabled) {
    event.preventDefault()
    return
  }

  const cardElement = event.currentTarget.closest('.weather-card')

  if (cardElement && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'

    // 드래그 이미지 추가
    event.dataTransfer.setDragImage(cardElement, cardElement.offsetWidth - 24, 24)
  }

  isDragging.value = true

  emit('drag-start', props.cityItem.id, event)
}

const handleDragEnd = () => {
  isDragging.value = false
  emit('drag-end')
}
</script>

<template>
  <el-card
    shadow="never"
    class="weather-card"
    :class="[
      weatherToneClass,
      { 'weather-card--dragging': isDragging, 'weather-card--favorite': cityItem.isFavorite },
    ]"
    @click="emit('selected-name', cityItem.name)"
  >
    <div class="card-glow"></div>

    <div class="card-header">
      <div class="location-label">
        <span>{{ cityItem.name }}</span>

        <el-tag>
          {{ cityItem.status }}
        </el-tag>
      </div>

      <div class="card-header-actions">
        <img
          v-if="iconUrl"
          :src="iconUrl"
          :alt="`${cityItem.name} 날씨 아이콘`"
          class="weather-icon"
        />

        <!-- 세 버튼을 별도의 세로 영역으로 묶습니다. -->
        <div class="card-side-actions">
          <button
            type="button"
            class="drag-handle"
            :class="{
              'drag-handle--disabled': !dragEnabled,
            }"
            :draggable="dragEnabled"
            :aria-disabled="String(!dragEnabled)"
            :title="
              dragEnabled
                ? '드래그하여 카드 순서 변경'
                : '검색어를 초기화하면 순서를 변경할 수 있습니다.'
            "
            aria-label="카드 순서 변경"
            @click.stop
            @dragstart.stop="handleDragStart"
            @dragend.stop="handleDragEnd"
          >
            <span aria-hidden="true">⠿</span>
          </button>

          <button
            type="button"
            class="card-icon-button favorite-button"
            :class="{
              'favorite-button--active': cityItem.isFavorite,
            }"
            :aria-pressed="Boolean(cityItem.isFavorite)"
            :title="cityItem.isFavorite ? '즐겨찾기에서 해제' : '즐겨찾기에 추가'"
            @click.stop="emit('toggle-favorite', cityItem.id)"
          >
            <span aria-hidden="true">
              {{ cityItem.isFavorite ? '★' : '☆' }}
            </span>
          </button>

          <button
            type="button"
            class="card-icon-button delete-button"
            :title="`${cityItem.name} 삭제`"
            @click.stop="emit('remove-city', cityItem.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>

    <div class="temperature-row">
      <strong class="current-temperature">
        {{ displayTemp }}<span>{{ configStore.unitSymbol }}</span>
      </strong>

      <el-tag :type="comfortTag.type" round effect="light">
        {{ comfortTag.label }}
      </el-tag>
    </div>

    <div class="weather-metrics">
      <div class="metric-item">
        <span>체감</span>
        <strong>{{ displayFeelsLike }}{{ configStore.unitSymbol }}</strong>
      </div>
      <div class="metric-item">
        <span>습도</span>
        <strong>{{ cityItem.humidity ?? '-' }}%</strong>
      </div>
      <div class="metric-item">
        <span>최고</span>
        <strong>{{ displayMaxTemp }}{{ configStore.unitSymbol }}</strong>
      </div>
      <div class="metric-item">
        <span>최저</span>
        <strong>{{ displayMinTemp }}{{ configStore.unitSymbol }}</strong>
      </div>
    </div>

    <div class="updated-at">마지막 갱신 {{ formattedUpdatedAt }}</div>

    <div class="card-actions">
      <el-button plain round @click.stop="emit('refresh-weather', cityItem.id)">
        날씨 갱신
      </el-button>
      <el-button type="primary" round @click.stop="emit('selected-detail', cityItem.id)">
        상세보기
      </el-button>
    </div>
  </el-card>
</template>

<style scoped src="../../assets/styles/components/weather-card.css"></style>
