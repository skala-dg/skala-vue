import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// 온도 단위 저장
export const useConfigStore = defineStore('config', () => {
  // state: 섭씨 또는 화씨 저장용
  const unit = ref('celsius')
  // getters: 단위에 맞는 기호
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })
  // actions: 섭씨와 화씨 토글하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})
