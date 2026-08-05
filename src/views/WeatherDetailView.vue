<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useConfigStore } from '@/stores/configStore'
import { useAPI } from '@/components/utils/apiHandler'

const configStore = useConfigStore()
const route = useRoute()
const router = useRouter()

const { weatherList, isLoading, errorMsg, refreshCity } = useAPI()

const cityItem = computed(() =>
  weatherList.value.find((city) => String(city.id) === String(route.params.cityId)),
)

const convertTemp = (temp) => {
  if (temp === null || temp === undefined) return '-'

  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  return Math.round(temp)
}

const displayTemp = computed(() => convertTemp(cityItem.value?.temp))
const displayFeelsLike = computed(() => convertTemp(cityItem.value?.feelsLike))
const displayMaxTemp = computed(() => convertTemp(cityItem.value?.tempMax))
const displayMinTemp = computed(() => convertTemp(cityItem.value?.tempMin))

const handleRefresh = async () => {
  if (!cityItem.value) return

  const updatedCity = await refreshCity(cityItem.value.id)

  if (updatedCity) {
    ElMessage.success(`${updatedCity.name}의 날씨를 갱신했습니다.`)
  }
}

const iconUrl = computed(() => {
  if (!cityItem.value?.icon) return ''

  return `https://openweathermap.org/payload/api/media/file/${cityItem.value.icon}.png`
})

const formattedUpdatedAt = computed(() => {
  if (!cityItem.value?.updatedAt) return '정보 없음'

  const rawTimestamp = Number(cityItem.value.updatedAt)
  const timestamp = rawTimestamp < 100000000000 ? rawTimestamp * 1000 : rawTimestamp
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return String(cityItem.value.updatedAt)
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})
</script>

<template>
  <section class="weather-detail">
    <el-button text class="back-button" @click="router.push('/')">
      ← 도시 목록으로 돌아가기
    </el-button>

    <template v-if="cityItem">
      <header class="detail-hero">
        <div class="detail-hero-copy">
          <span class="detail-eyebrow">WEATHER DETAIL</span>
          <div class="detail-title-row">
            <div>
              <h1>{{ cityItem.name }}</h1>
              <p>{{ cityItem.status }}</p>
            </div>

            <img
              v-if="iconUrl"
              :src="iconUrl"
              :alt="`${cityItem.name} ${cityItem.status} 날씨 아이콘`"
              class="detail-weather-icon"
            />
          </div>
        </div>

        <div class="detail-temperature">
          <strong>{{ displayTemp }}</strong>
          <span>{{ configStore.unitSymbol }}</span>
          <small>체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}</small>
        </div>
      </header>

      <el-alert
        v-if="errorMsg"
        class="detail-alert"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="false"
      />

      <div class="detail-layout">
        <BaseDashboardCard glass class="detail-info-card">
          <div class="card-section-header">
            <div>
              <span>OVERVIEW</span>
              <h2>상세 기상 정보</h2>
            </div>

            <el-button type="primary" round :loading="isLoading" @click="handleRefresh">
              현재 날씨 갱신
            </el-button>
          </div>

          <el-descriptions :column="2" border class="weather-descriptions">
            <el-descriptions-item label="현재 온도">
              {{ displayTemp }}{{ configStore.unitSymbol }}
            </el-descriptions-item>
            <el-descriptions-item label="체감 온도">
              {{ displayFeelsLike }}{{ configStore.unitSymbol }}
            </el-descriptions-item>
            <el-descriptions-item label="최고 기온">
              {{ displayMaxTemp }}{{ configStore.unitSymbol }}
            </el-descriptions-item>
            <el-descriptions-item label="최저 기온">
              {{ displayMinTemp }}{{ configStore.unitSymbol }}
            </el-descriptions-item>
            <el-descriptions-item label="날씨 상태">
              <el-tag round effect="light" type="info">{{ cityItem.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="마지막 갱신">
              {{ formattedUpdatedAt }}
            </el-descriptions-item>
          </el-descriptions>
        </BaseDashboardCard>

        <BaseDashboardCard glass class="humidity-card">
          <span class="detail-eyebrow">HUMIDITY</span>
          <h2>현재 습도</h2>
          <strong>{{ cityItem.humidity ?? '-' }}%</strong>

          <el-progress
            :percentage="Number(cityItem.humidity) || 0"
            :stroke-width="12"
            :show-text="false"
          />

          <p>습도는 현재 날씨 API에서 제공하는 상대습도 값입니다.</p>
        </BaseDashboardCard>
      </div>
    </template>

    <BaseDashboardCard v-else glass class="not-found-card">
      <el-empty description="선택한 도시 정보를 찾을 수 없습니다.">
        <el-button type="primary" round @click="router.push('/')"> 도시 목록으로 이동 </el-button>
      </el-empty>
    </BaseDashboardCard>
  </section>
</template>

<style scoped src="../assets/styles/views/weather-detail.css"></style>
