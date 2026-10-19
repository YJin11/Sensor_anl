/**
 * 대시보드 메인 제어 및 20대 기법 인터랙션 컨트롤러 (app.js)
 * 100% 클라이언트 브라우저 연산 및 렌더링
 * Zero External Transmission
 */

document.addEventListener("DOMContentLoaded", () => {
  // 상태 변수
  let currentCategory = "all";
  let selectedCompany = "hanbit"; // 기본 선택 기업

  // 1. 초기 연산 수행
  const rawData = RAW_SALES_DATA;
  const companies = ["hanbit", "mirae", "saebom"];

  // 기술통계량
  const statsMap = {
    hanbit: AnalyticsEngine.getDescriptiveStats(rawData.map(d => d.hanbit)),
    mirae: AnalyticsEngine.getDescriptiveStats(rawData.map(d => d.mirae)),
    saebom: AnalyticsEngine.getDescriptiveStats(rawData.map(d => d.saebom))
  };

  // 변동계수
  const cvMap = {
    hanbit: AnalyticsEngine.getCV(rawData.map(d => d.hanbit)),
    mirae: AnalyticsEngine.getCV(rawData.map(d => d.mirae)),
    saebom: AnalyticsEngine.getCV(rawData.map(d => d.saebom))
  };

  // OLS 회귀
  const regMap = {
    hanbit: AnalyticsEngine.getLinearRegression(rawData.map(d => d.hanbit)),
    mirae: AnalyticsEngine.getLinearRegression(rawData.map(d => d.mirae)),
    saebom: AnalyticsEngine.getLinearRegression(rawData.map(d => d.saebom))
  };

  // CAGR 지표
  const cagrData = AnalyticsEngine.getCAGRMetrics(rawData);

  // Holt 지수평활 예측
  const holtMap = {
    hanbit: AnalyticsEngine.getHoltForecast(rawData.map(d => d.hanbit)),
    mirae: AnalyticsEngine.getHoltForecast(rawData.map(d => d.mirae)),
    saebom: AnalyticsEngine.getHoltForecast(rawData.map(d => d.saebom))
  };

  // 시장 점유율 및 누적 매출
  const shareData = AnalyticsEngine.getMarketShareDynamics(rawData);
  const base100Data = AnalyticsEngine.getBase100Index(rawData);
  const cumData = AnalyticsEngine.getCumulativeRevenue(rawData);
  const hhiData = AnalyticsEngine.getHHIMetrics(rawData);
  const corrMatrix = AnalyticsEngine.getCorrelationMatrix(rawData);
  const anomalyData = AnalyticsEngine.getAnomalyDetection(rawData);
  const growthRiskMatrix = AnalyticsEngine.getGrowthRiskMatrix(rawData);

  // 2. 상단 KPI 카드 초기화
  function renderKPICards() {
    const kpiGrid = document.getElementById("kpiGrid");
    if (!kpiGrid) return;

    const total2025 = cagrData.hanbit.endVal + cagrData.mirae.endVal + cagrData.saebom.endVal;
    const total2021 = cagrData.hanbit.startVal + cagrData.mirae.startVal + cagrData.saebom.startVal;
    const marketGrowth = (((total2025 - total2021) / total2021) * 100).toFixed(1);

    kpiGrid.innerHTML = `
      <div class="kpi-card hanbit">
        <div class="kpi-header">
          <span class="kpi-title">한빛테크 (고성장 테크 선도)</span>
          <span class="kpi-badge badge-blue">점유율 1위</span>
        </div>
        <div class="kpi-value">${cagrData.hanbit.endVal} <span style="font-size:16px;">억원 (2025)</span></div>
        <div class="kpi-subtext">
          <span>CAGR 5개년: <strong class="trend-up">+${cagrData.hanbit.cagr}%</strong></span>
          <span>누적매출: ${cumData[cumData.length - 1].hanbit}억</span>
        </div>
      </div>

      <div class="kpi-card mirae">
        <div class="kpi-header">
          <span class="kpi-title">미래솔루션 (안정 성장 캐시카우)</span>
          <span class="kpi-badge badge-green">점유율 2위</span>
        </div>
        <div class="kpi-value">${cagrData.mirae.endVal} <span style="font-size:16px;">억원 (2025)</span></div>
        <div class="kpi-subtext">
          <span>CAGR 5개년: <strong class="trend-up">+${cagrData.mirae.cagr}%</strong></span>
          <span>누적매출: ${cumData[cumData.length - 1].mirae}억</span>
        </div>
      </div>

      <div class="kpi-card saebom">
        <div class="kpi-header">
          <span class="kpi-title">새봄산업 (전통 제조/계절형)</span>
          <span class="kpi-badge badge-amber">점유율 3위</span>
        </div>
        <div class="kpi-value">${cagrData.saebom.endVal} <span style="font-size:16px;">억원 (2025)</span></div>
        <div class="kpi-subtext">
          <span>CAGR 5개년: <strong class="trend-down">${cagrData.saebom.cagr}%</strong></span>
          <span>누적매출: ${cumData[cumData.length - 1].saebom}억</span>
        </div>
      </div>

      <div class="kpi-card market">
        <div class="kpi-header">
          <span class="kpi-title">3사 합산 총 시장규모</span>
          <span class="kpi-badge badge-purple">시장 확장세</span>
        </div>
        <div class="kpi-value">${total2025.toFixed(1)} <span style="font-size:16px;">억원</span></div>
        <div class="kpi-subtext">
          <span>5개년 총성장: <strong class="trend-up">+${marketGrowth}%</strong></span>
          <span>최신 HHI: <strong>${hhiData[hhiData.length - 1].hhi}</strong></span>
        </div>
      </div>
    `;
  }

  // 3. 20가지 기법 렌더링 함수
  function renderAllMethods() {
    const compName = COMPANY_META[selectedCompany].name;
    const compColor = COMPANY_META[selectedCompany].color;

    // 기법 1: 기초 기술통계 요약
    ChartManager.renderMethod1("chart_method1", statsMap);

    // 기법 2: 왜도, 첨도 및 히스토그램
    const distData = AnalyticsEngine.getDistributionMetrics(rawData.map(d => d[selectedCompany]), 7);
    ChartManager.renderMethod2("chart_method2", distData, compName, compColor);
    const m2Insight = document.getElementById("insight_method2");
    if (m2Insight) {
      m2Insight.innerHTML = `
        <strong>[분포 특성 해설]</strong> ${compName}의 왜도(Skewness)는 <strong>${distData.skewness}</strong>, 첨도(Kurtosis)는 <strong>${distData.kurtosis}</strong>입니다. 
        ${distData.skewness > 0.3 ? "우측 꼬리가 긴 양의 왜도로 고매출 발생 빈도가 집중되어 있음을 보여줍니다." : distData.skewness < -0.3 ? "좌측 꼬리가 길어 특정 비수기 급락이 관측됩니다." : "정규분포에 가까운 대칭적 매출 분포를 형성하고 있습니다."}
      `;
    }

    // 기법 3: 사분위 박스플롯 지표
    const boxData = AnalyticsEngine.getBoxPlotData(rawData);
    ChartManager.renderMethod3("chart_method3", boxData);

    // 기법 4: 변동계수 (CV)
    ChartManager.renderMethod4("chart_method4", cvMap);

    // 기법 5: OLS 선형 회귀 추세
    ChartManager.renderMethod5("chart_method5", rawData, regMap, selectedCompany);
    const m5Insight = document.getElementById("insight_method5");
    if (m5Insight) {
      m5Insight.innerHTML = `
        <strong>[회귀 분석 해설]</strong> ${compName}의 장기 선형 회귀식은 <strong>y = ${regMap[selectedCompany].intercept} + ${regMap[selectedCompany].slope}t</strong> (결정계수 R² = <strong>${regMap[selectedCompany].rSquared}</strong>)입니다. 
        매월 평균 <strong>${regMap[selectedCompany].monthlyDelta}억원</strong>씩 꾸준히 ${regMap[selectedCompany].slope > 0 ? "증가" : "감소"}하는 매우 유의미한 추세를 보입니다.
      `;
    }

    // 기법 6: CAGR 및 연도별 성장률
    ChartManager.renderMethod6("chart_method6", cagrData);

    // 기법 7: 이동평균 (SMA 3M / 6M / 12M)
    const maData = AnalyticsEngine.getMovingAverages(rawData.map(d => d[selectedCompany]));
    ChartManager.renderMethod7("chart_method7", rawData, maData, selectedCompany);

    // 기법 8: Holt 지수평활 및 2026 예측
    ChartManager.renderMethod8("chart_method8", rawData, holtMap, selectedCompany);
    const m8Insight = document.getElementById("insight_method8");
    if (m8Insight) {
      const predEnd = holtMap[selectedCompany].forecast[11];
      m8Insight.innerHTML = `
        <strong>[지수평활 예측 해설]</strong> 수준(Level: ${holtMap[selectedCompany].finalLevel})과 추세(Trend: ${holtMap[selectedCompany].finalTrend})를 반영한 결과, 
        2026년 12월 ${compName}의 월간 매출은 <strong>${predEnd}억원</strong>에 도달할 것으로 정밀 추정됩니다.
      `;
    }

    // 기법 9: 월별 계절 지수
    const seasonData = AnalyticsEngine.getSeasonalityIndex(rawData, selectedCompany);
    ChartManager.renderMethod9("chart_method9", seasonData, compName);

    // 기법 10: 계절성 히트맵 매트릭스
    const matrixData = AnalyticsEngine.getHeatmapMatrix(rawData, selectedCompany);
    ChartManager.renderMethod10("heatmap_container", matrixData);

    // 기법 11: 분기별 실적 집계
    const quarterData = AnalyticsEngine.getQuarterlyMetrics(rawData);
    ChartManager.renderMethod11("chart_method11", quarterData);

    // 기법 12: 시장 점유율 누적 영역
    ChartManager.renderMethod12("chart_method12", shareData);

    // 기법 13: 기준 시점 지수화 (Base-100)
    ChartManager.renderMethod13("chart_method13", base100Data);

    // 기법 14: 누적 총매출 곡선
    ChartManager.renderMethod14("chart_method14", cumData);

    // 기법 15: HHI 시장 집중도 지수
    ChartManager.renderMethod15("chart_method15", hhiData);

    // 기법 16: 교차 상관계수 매트릭스
    ChartManager.renderMethod16("correlation_container", corrMatrix);

    // 기법 17: 리드-래그 시차 상관 분석
    const leadLag = AnalyticsEngine.getLeadLagCorrelation(rawData, "hanbit", "mirae", 6);
    ChartManager.renderMethod17("chart_method17", leadLag, "한빛테크 vs 미래솔루션");

    // 기법 18: Z-Score 이상치 탐지
    ChartManager.renderMethod18("chart_method18", anomalyData[selectedCompany], compName);
    const m18Insight = document.getElementById("insight_method18");
    if (m18Insight) {
      const outliers = anomalyData[selectedCompany].outlierList;
      m18Insight.innerHTML = `
        <strong>[이상치 탐지 해설]</strong> 2.0σ(상한 ${anomalyData[selectedCompany].thresholdUpper}억, 하한 ${anomalyData[selectedCompany].thresholdLower}억) 기준, 
        ${outliers.length > 0 ? `총 <strong>${outliers.length}건</strong>의 유의미한 이상치(${outliers.map(o => `${o.month}: ${o.value}억 [${o.direction}]`).join(", ")})가 식별되었습니다.` : "기준 임계치를 이탈한 극단적 통계적 이상치 없이 안정적 분포를 유지하고 있습니다."}
      `;
    }

    // 기법 19: 성장률-변동성 포트폴리오 매트릭스
    ChartManager.renderMethod19("chart_method19", growthRiskMatrix);

    // 기법 20: 몬테카를로 1,000회 시뮬레이션
    const mcData = AnalyticsEngine.getMonteCarloForecast(rawData, selectedCompany, 1000, 12);
    ChartManager.renderMethod20("chart_method20", mcData, compName);
    const m20Insight = document.getElementById("insight_method20");
    if (m20Insight) {
      const step12 = mcData.summarySteps[11];
      m20Insight.innerHTML = `
        <strong>[확률적 시뮬레이션 해설]</strong> 1,000회 몬테카를로 시뮬레이션 결과, 2026년 12월 ${compName}의 90% 신뢰구간은 
        <strong>${step12.p5}억원(비관 5%) ~ ${step12.p95}억원(낙관 95%)</strong>이며, 중앙값은 <strong>${step12.p50}억원</strong>으로 수렴합니다.
      `;
    }
  }

  // 4. 원천 데이터 테이블 렌더링
  function renderRawDataTable() {
    const tableBody = document.getElementById("rawTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = rawData
      .map(
        d => `
        <tr>
          <td><strong>${d.month}</strong></td>
          <td style="color:#60a5fa; font-weight:600;">${d.hanbit}</td>
          <td style="color:#34d399; font-weight:600;">${d.mirae}</td>
          <td style="color:#fbbf24; font-weight:600;">${d.saebom}</td>
          <td><strong>${(d.hanbit + d.mirae + d.saebom).toFixed(2)}</strong></td>
        </tr>
      `
      )
      .join("");
  }

  // 5. CSV 다운로드 기능 (100% 클라이언트 브라우저 생성, 외부 전송 없음)
  function exportCSV() {
    let csvContent = "\uFEFF기준월,한빛테크 매출(억원),미래솔루션 매출(억원),새봄산업 매출(억원),3사 총매출(억원)\n";
    rawData.forEach(d => {
      const total = (d.hanbit + d.mirae + d.saebom).toFixed(2);
      csvContent += `${d.month},${d.hanbit},${d.mirae},${d.saebom},${total}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "가상기업_3사_5개년매출_분석데이터.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 6. 카테고리 탭 필터링
  function filterCardsByCategory(category) {
    currentCategory = category;
    const cards = document.querySelectorAll(".method-card");

    cards.forEach(card => {
      const cardCat = card.getAttribute("data-category");
      if (category === "all" || cardCat === category) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-category") === category);
    });
  }

  // 7. 이벤트 리스너 등록
  const companySelect = document.getElementById("companySelect");
  if (companySelect) {
    companySelect.addEventListener("change", e => {
      selectedCompany = e.target.value;
      renderAllMethods();
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterCardsByCategory(btn.getAttribute("data-category"));
    });
  });

  const exportBtn = document.getElementById("exportCsvBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportCSV);

  // 테마 토글 (다크/라이트)
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      themeToggleBtn.textContent = isLight ? "🌙 다크 모드" : "☀️ 라이트 모드";
    });
  }

  // 모달 제어
  const openModalBtn = document.getElementById("openReportBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalOverlay = document.getElementById("reportModal");

  if (openModalBtn && modalOverlay) {
    openModalBtn.addEventListener("click", () => modalOverlay.classList.add("open"));
  }
  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("open"));
  }
  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("open");
    });
  }

  // 최초 렌더링 실행
  renderKPICards();
  renderAllMethods();
  renderRawDataTable();
});
