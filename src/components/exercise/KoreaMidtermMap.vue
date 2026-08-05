<script setup>
import { computed, reactive, ref } from 'vue'

import koreaMapSvg from '@/assets/korea-midterm-regions.svg?raw'
import { fetchFiveDayTemperature } from '@/components/utils/kmaMidtermApi'
import { useConfigStore } from '@/stores/configStore'

const REGION_INFO = {
  capital: {
    label: '수도권',
    representative: '서울',
    regId: '11B10101',
  },
  gangwon: {
    label: '강원',
    representative: '춘천',
    regId: '11D10301',
  },
  chungbuk: {
    label: '충북',
    representative: '청주',
    regId: '11C10301',
  },
  chungnam: {
    label: '충남',
    representative: '대전',
    regId: '11C20401',
  },
  jeonbuk: {
    label: '전북',
    representative: '전주',
    regId: '11F10201',
  },
  jeonnam: {
    label: '전남',
    representative: '광주',
    regId: '11F20501',
  },
  gyeongbuk: {
    label: '경북',
    representative: '대구',
    regId: '11H10701',
  },
  gyeongnam: {
    label: '경남',
    representative: '부산',
    regId: '11H20201',
  },
  jeju: {
    label: '제주',
    representative: '제주',
    regId: '11G00201',
  },
}

const mapStage = ref(null)
const activeRegionKey = ref('')
const configStore = useConfigStore()

const tooltip = reactive({
  visible: false,
  x: 16,
  y: 16,
})

// 구역별 요청 결과를 저장
const forecastByRegion = reactive({})

const activeRegion = computed(() => {
  return REGION_INFO[activeRegionKey.value] || null
})

const activeForecast = computed(() => {
  return forecastByRegion[activeRegionKey.value] || null
})

const findRegionElement = (target) => {
  if (!(target instanceof Element)) {
    return null
  }

  return target.closest('[data-region-key]')
}

const updateActiveClass = (regionKey) => {
  const regionElements = mapStage.value?.querySelectorAll('[data-region-key]')

  regionElements?.forEach((element) => {
    element.classList.toggle('is-active', element.dataset.regionKey === regionKey)
  })
}

const updateTooltipPosition = (clientX, clientY) => {
  if (!mapStage.value) {
    return
  }

  const stageRect = mapStage.value.getBoundingClientRect()
  const tooltipWidth = 230
  const tooltipHeight = 145
  const padding = 12

  const relativeX = clientX - stageRect.left + 16
  const relativeY = clientY - stageRect.top + 16

  tooltip.x = Math.min(
    Math.max(padding, relativeX),
    Math.max(padding, stageRect.width - tooltipWidth - padding),
  )

  tooltip.y = Math.min(
    Math.max(padding, relativeY),
    Math.max(padding, stageRect.height - tooltipHeight - padding),
  )
}

const updateTooltipFromElement = (element) => {
  const elementRect = element.getBoundingClientRect()

  updateTooltipPosition(
    elementRect.left + elementRect.width / 2,
    elementRect.top + elementRect.height / 2,
  )
}

const loadForecast = async (regionKey) => {
  const region = REGION_INFO[regionKey]

  if (!region) {
    return
  }

  const currentState = forecastByRegion[regionKey]

  if (currentState?.status === 'loading' || currentState?.status === 'success') {
    return
  }

  forecastByRegion[regionKey] = {
    status: 'loading',
  }

  try {
    const forecast = await fetchFiveDayTemperature(region.regId)

    forecastByRegion[regionKey] = {
      status: 'success',
      ...forecast,
    }
  } catch (error) {
    forecastByRegion[regionKey] = {
      status: 'error',
      message: error instanceof Error ? error.message : '중기기온 정보를 불러오지 못했습니다.',
    }
  }
}

const openRegion = (regionElement, event) => {
  const regionKey = regionElement.dataset.regionKey

  if (!REGION_INFO[regionKey]) {
    return
  }

  activeRegionKey.value = regionKey
  tooltip.visible = true
  updateActiveClass(regionKey)

  if (event instanceof MouseEvent) {
    updateTooltipPosition(event.clientX, event.clientY)
  } else {
    updateTooltipFromElement(regionElement)
  }

  loadForecast(regionKey)
}

const handleMouseOver = (event) => {
  const regionElement = findRegionElement(event.target)

  if (regionElement) {
    openRegion(regionElement, event)
  }
}

const handleMouseMove = (event) => {
  if (tooltip.visible) {
    updateTooltipPosition(event.clientX, event.clientY)
  }
}

const handleClick = (event) => {
  const regionElement = findRegionElement(event.target)

  if (regionElement) {
    openRegion(regionElement, event)
  }
}

const handleFocusIn = (event) => {
  const regionElement = findRegionElement(event.target)

  if (regionElement) {
    openRegion(regionElement, event)
  }
}

const handleKeyboardOpen = (event) => {
  const regionElement = findRegionElement(event.target)

  if (regionElement) {
    openRegion(regionElement, event)
  }
}

const closeTooltip = () => {
  tooltip.visible = false
  activeRegionKey.value = ''
  updateActiveClass('')
}

const getRegionElement = (target) => {
  if (!(target instanceof Element)) {
    return null
  }

  return target.closest('[data-region-key]')
}

// 마우스가 현재 구역을 벗어나면 툴팁 닫게
const handleMouseOut = (event) => {
  const currentRegion = getRegionElement(event.target)
  const nextRegion = getRegionElement(event.relatedTarget)

  if (!currentRegion) {
    return
  }

  // 같은 권역 안의 다른 SVG 도형으로 이동한 경우에는 유지
  if (nextRegion && nextRegion.dataset.regionKey === currentRegion.dataset.regionKey) {
    return
  }

  closeTooltip()
}

const formatTemperature = (temperature) => {
  const celsius = Number(temperature)

  if (!Number.isFinite(celsius)) {
    return '-'
  }

  if (configStore.unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32)
  }

  return Math.round(celsius)
}
</script>

<template>
  <section class="midterm-map-panel" aria-label="대한민국 5일 뒤 지역별 예상기온 지도">
    <div
      ref="mapStage"
      class="midterm-map-stage"
      @mouseover="handleMouseOver"
      @mouseout="handleMouseOut"
      @mousemove="handleMouseMove"
      @mouseleave="closeTooltip"
      @click="handleClick"
      @focusin="handleFocusIn"
      @keydown.enter.prevent="handleKeyboardOpen"
      @keydown.space.prevent="handleKeyboardOpen"
    >
      <div class="midterm-map-svg-host" v-html="koreaMapSvg" />

      <div
        v-if="tooltip.visible && activeRegion"
        class="midterm-map-tooltip"
        :style="{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
        }"
        aria-live="polite"
      >
        <strong>{{ activeRegion.label }}</strong>

        <span class="tooltip-subtitle"> {{ activeRegion.representative }} - 5일 뒤 </span>

        <p v-if="!activeForecast || activeForecast.status === 'loading'" class="tooltip-message">
          기온 정보를 불러오는 중입니다.
        </p>

        <p v-else-if="activeForecast.status === 'error'" class="tooltip-error">
          {{ activeForecast.message }}
        </p>

        <div v-else class="tooltip-temperatures">
          <span>
            최저
            {{ formatTemperature(activeForecast.minTemperature) }}
            {{ configStore.unitSymbol }}
          </span>

          <span>
            최고
            {{ formatTemperature(activeForecast.maxTemperature) }}
            {{ configStore.unitSymbol }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.midterm-map-panel {
  width: 100%;
}

.midterm-map-stage {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 700px;
  overflow: hidden;

  background: radial-gradient(circle at center, rgba(219, 234, 254, 0.55), transparent 65%);

  border-radius: 20px;
}

.midterm-map-svg-host {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 700px;
}

.midterm-map-svg-host :deep(svg) {
  display: block;

  width: auto;
  height: 660px;
  max-width: 92%;
}

.midterm-map-tooltip {
  position: absolute;
  z-index: 10;

  display: flex;
  flex-direction: column;
  gap: 6px;

  width: 230px;
  padding: 15px 17px;

  color: #172033;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(30, 64, 175, 0.17);

  pointer-events: none;
}

.midterm-map-svg-host :deep(.korea-region) {
  fill: #bfdbfe !important;

  stroke: #ffffff;
  stroke-width: 1.7;
  stroke-linejoin: round;

  cursor: pointer;
  outline: none;

  transition:
    fill 0.18s ease,
    filter 0.18s ease,
    opacity 0.18s ease;
}

.midterm-map-svg-host :deep(.korea-region:hover),
.midterm-map-svg-host :deep(.korea-region:focus),
.midterm-map-svg-host :deep(.korea-region.is-active) {
  fill: #3b82f6 !important;

  filter: drop-shadow(0 6px 8px rgba(37, 99, 235, 0.28));
}

.tooltip-subtitle,
.tooltip-message,
.tooltip-error {
  margin: 0;
  font-size: 13px;
}

.tooltip-subtitle,
.tooltip-message {
  color: #71809a;
}

.tooltip-error {
  color: #dc2626;
}

.tooltip-temperatures {
  display: flex;
  gap: 8px;
  margin-top: 5px;
}

.tooltip-temperatures span {
  flex: 1;
  padding: 8px 7px;
  background: #eff6ff;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 820px) {
  .midterm-map-panel {
    grid-template-columns: 1fr;
  }

  .midterm-map-stage,
  .midterm-map-svg-host {
    min-height: 440px;
    height: 440px;
  }
}

@media (max-width: 520px) {
  .midterm-map-panel {
    padding: 20px;
  }

  .midterm-map-stage,
  .midterm-map-svg-host {
    min-height: 380px;
    height: 380px;
  }
}
</style>
