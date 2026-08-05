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
  const rawTemp = temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const displayTemp = computed(() => convertTemp(props.cityItem.temp))
const displayFeelsLike = computed(() => convertTemp(props.cityItem.feelsLike))
const displayMaxTemp = computed(() => convertTemp(props.cityItem.tempMax))
const displayMinTemp = computed(() => convertTemp(props.cityItem.tempMin))

const iconUrl = computed(() => {
  if (!props.cityItem.icon) {
    return ''
  }
  return `https://openweathermap.org/payload/api/media/file/${props.cityItem.icon}.png`
})
</script>
<template>
  <div class="weather-box" @click="emit('selected-name', cityItem.name)">
    <div class="city-title">
      <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>

      <img
        v-if="iconUrl"
        :src="iconUrl"
        :alt="`${cityItem.name} ${cityItem.status} 날씨 아이콘`"
        class="weather-icon"
      />
    </div>
    <p>
      현재 기온:
      {{ displayTemp }}{{ configStore.unitSymbol }}
    </p>
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
    <p>{{ cityItem.updatedAt }}</p>

    <span v-if="cityItem.temp >= 25" class="hot-icon">더움 (25도 이상)</span>
    <span v-else class="cold-icon">시원함 (25도 미만)</span>

    <button class="detail-btn" @click.stop="emit('selected-detail', cityItem.id)">상세보기</button>
  </div>
</template>
<style scoped>
.city-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.city-title h4 {
  margin: 0;
}

.weather-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
</style>
