<script setup></script>
<template>
  <div class="notFound">
    <h1>You're in a wrong page</h1>
    <nav>
      <RouterLink to="/">홈으로 돌아가기</RouterLink>
    </nav>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
