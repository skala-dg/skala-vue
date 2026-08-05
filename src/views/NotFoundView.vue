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
.notFound {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

@media (min-width: 1024px) {
  .notFound {
    min-height: 100vh;
  }
}
</style>
