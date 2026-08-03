<script setup>
defineEmits({ query: String })
</script>
<template>
  <input
    type="text"
    :value="searchQuery"
    @input="$emit('query', $event.target.value)"
    placeholder="검색할 도시 이름 입력"
  />
</template>
<style scoped></style>
<!--
<section class="search-box">
      <h3>도시 검색</h3>
      <input
        type="text"
        :value="searchQuery"
        @input="(e) => (searchQuery = e.target.value)"
        placeholder="검색할 도시 이름 입력"
      />
      <p>
        검색 중인 도시: <b>{{ searchQuery }}</b>
      </p>
    </section>
-->
