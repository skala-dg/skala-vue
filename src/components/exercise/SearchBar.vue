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
    <h3>도시 검색</h3>
    <input
      type="text"
      :value="currentQuery"
      @input="$emit('query', $event.target.value)"
      placeholder="검색할 도시 이름 입력"
    />
    <p>
      검색 중인 도시: <b>{{ currentQuery }}</b>
    </p>
  </div>
</template>
<style scoped></style>
