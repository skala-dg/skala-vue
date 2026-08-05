/** * 검색창 */
<script setup>
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})

defineEmits(['query'])
</script>

<template>
  <div class="search-box">
    <div class="search-copy">
      <span class="search-eyebrow">CITY FINDER</span>
      <h3>등록된 도시 검색</h3>
      <p>도시 이름 또는 한글 초성으로 빠르게 찾을 수 있습니다.</p>
    </div>

    <el-input
      class="city-search-input"
      size="large"
      clearable
      :model-value="currentQuery"
      placeholder="예: 서울, 부산, ㅅㅇ"
      aria-label="등록된 도시 검색"
      @update:model-value="$emit('query', $event)"
    />
  </div>
</template>

<style scoped src="../../assets/styles/components/search-bar.css"></style>
