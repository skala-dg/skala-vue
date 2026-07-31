<script setup>
import { ref } from 'vue'
const search_input = ref('')
</script>

<template>
  <div class="weather1">
    <h2 class="weather1_title">과제 1: 날씨 (Mockup)</h2>
    <br />
    <hr />
    <section class="search_box">
      <h3>도시 검색</h3>
      <input
        type="text"
        :value="search_input"
        @input="(e) => (search_input = e.target.value)"
        placeholder="검색할 도시 이름 입력"
      />
    </section>
  </div>
</template>

<style scoped></style>
