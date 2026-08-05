<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="about-page">
    <section class="about-hero">
      <p class="eyebrow">ABOUT SKALA WEATHER</p>
      <h1>서비스 소개</h1>

      <p>
        여러 도시의 현재 날씨와 한국의 중기기온 예보를 확인할 수 있는 Vue.js 기반 날씨 서비스입니다.
      </p>
    </section>

    <!-- 날씨 대시보드 -->
    <section class="service-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">CITY WEATHER DASHBOARD</p>
          <h2>날씨 대시보드</h2>
        </div>

        <RouterLink to="/" class="page-link"> 대시보드 바로가기 </RouterLink>
      </div>

      <div class="feature-grid">
        <article>
          <h3>첫 방문 자동 등록</h3>
          <p>
            위치 정보 제공을 허용하면 현재 지역이 자동으로 추가됩니다. 위치 확인이 불가능하면 서울과
            뉴욕이 기본으로 등록됩니다.
          </p>
        </article>

        <article>
          <h3>도시 관리</h3>
          <p>
            도시를 검색하고 추가하거나 삭제할 수 있으며, 즐겨찾기한 도시만 따로 확인할 수 있습니다.
          </p>
        </article>

        <article>
          <h3>카드 순서 변경</h3>
          <p>각 카드 우측 상단의 드래그 버튼을 이용해 등록한 도시의 순서를 변경할 수 있습니다.</p>
        </article>

        <article>
          <h3>날씨 확인</h3>
          <p>
            현재기온, 체감온도, 습도 등의 정보를 확인하고 개별 또는 전체 날씨를 갱신할 수 있습니다.
          </p>
        </article>
      </div>
    </section>

    <!-- 한국 중기예보 -->
    <section class="service-section korea-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">KOREA MID-TERM FORECAST</p>
          <h2>한국 중기기온 예보</h2>
        </div>

        <RouterLink to="/korea" class="page-link"> 중기예보 바로가기 </RouterLink>
      </div>

      <div class="korea-description">
        <p>
          대한민국 지도 위의 지역에 마우스를 올리면 대표 도시의 5일 뒤 예상 최저기온과 최고기온을
          확인할 수 있습니다.
        </p>

        <p>
          지도는 세부 행정구역이 아닌 광역 권역으로 구성되어 있으며, 표시되는 값은 해당 권역 전체의
          평균이 아니라 대표 도시의 예보입니다.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  width: min(1120px, 92%);
  margin: 0 auto;
  padding: 48px 0 80px;
}

.about-hero,
.service-section {
  padding: 38px 40px;

  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
}

.service-section {
  margin-top: 30px;
}

.korea-section {
  margin-top: 42px;
}

.eyebrow {
  margin: 0 0 10px;

  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

h1,
h2,
h3 {
  margin-top: 0;
  color: #172033;
}

.about-hero p:last-child,
article p,
.korea-description p {
  color: #64748b;
  line-height: 1.75;
  word-break: keep-all;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  margin-bottom: 26px;
  padding-bottom: 22px;

  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.feature-grid article {
  padding: 24px;

  background: rgba(248, 250, 252, 0.86);
  border-radius: 18px;
}

.feature-grid h3 {
  margin-bottom: 10px;
  font-size: 17px;
}

.feature-grid p {
  margin: 0;
  font-size: 14px;
}

.page-link {
  flex: 0 0 auto;

  padding: 11px 18px;

  color: white;
  background: #3b82f6;

  font-size: 14px;
  font-weight: 700;
  text-decoration: none;

  border-radius: 999px;
}

.korea-description {
  padding: 24px;

  background: rgba(239, 246, 255, 0.65);
  border-radius: 18px;
}

.korea-description p {
  margin: 0;
}

.korea-description p + p {
  margin-top: 12px;
}

@media (max-width: 720px) {
  .about-hero,
  .service-section {
    padding: 28px 22px;
  }

  .section-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .page-link {
    align-self: flex-start;
  }
}
</style>
