<script setup>
import KoreaMidtermMap from '@/components/exercise/KoreaMidtermMap.vue'
</script>

<template>
  <main class="korea-page">
    <section class="korea-hero">
      <div>
        <p class="korea-eyebrow">KOREA MID-TERM FORECAST</p>

        <h1 class="korea-title">한국 중기기온 예보</h1>

        <p class="korea-description">
          지도 위의 지역에 마우스를 올리면 대표 지역의 5일 뒤 예상 최저기온과 최고기온을 확인할 수
          있습니다.
        </p>
      </div>

      <div class="korea-guide">
        <strong>이용 방법</strong>
        <span> 지도 위 지역에 마우스를 올려보세요. </span>
      </div>
    </section>

    <section class="korea-map-section">
      <KoreaMidtermMap />
    </section>

    <section class="korea-notice">
      <h2>예보 안내</h2>

      <p>
        각 지도 구역은 세부 행정구역 전체의 평균값이 아니라, 해당 권역을 대표하는 도시의 기온 정보를
        보여줍니다.
      </p>

      <p>
        기상청 중기기온 예보는 하루 두 번 발표되며, 이 화면에서는 5일 뒤 예상 최저기온과 최고기온을
        표시합니다.
      </p>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/views/korea.css"></style>
