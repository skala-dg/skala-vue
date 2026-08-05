<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['selected-name', 'selected-detail', 'refresh-weather'])

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
</script>

<template>
  <el-card
    shadow="never"
    class="weather-card"
    :class="weatherToneClass"
    @click="emit('selected-name', cityItem.name)"
  >
    <div class="card-glow"></div>

    <div class="card-header">
      <div>
        <span class="location-label">CURRENT WEATHER</span>
        <h3>{{ cityItem.name }}</h3>
        <el-tag size="small" round effect="light" type="info">
          {{ cityItem.status }}
        </el-tag>
      </div>

      <img
        v-if="iconUrl"
        :src="iconUrl"
        :alt="`${cityItem.name} ${cityItem.status} 날씨 아이콘`"
        class="weather-icon"
      />
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
