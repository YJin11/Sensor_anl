/**
 * 대시보드 시각화 차트 렌더링 엔진 (charts.js)
 * Chart.js 환경 우선 활용 + CDN 미연결/오프라인 환경에서도 Canvas 기반 폴백 지원
 * 100% 로컬 연산 및 렌더링 (외부 데이터 전송 제로)
 */

const ChartManager = {
  instances: {},

  destroyChart(id) {
    if (this.instances[id]) {
      if (typeof this.instances[id].destroy === "function") {
        this.instances[id].destroy();
      }
      delete this.instances[id];
    }
  },

  // 1. 기초 기술통계 요약 차트 (평균, 중앙값, 표준편차)
  renderMethod1(canvasId, statsMap) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = ["한빛테크", "미래솔루션", "새봄산업"];
    const means = [statsMap.hanbit.mean, statsMap.mirae.mean, statsMap.saebom.mean];
    const medians = [statsMap.hanbit.median, statsMap.mirae.median, statsMap.saebom.median];
    const stdDevs = [statsMap.hanbit.stdDev, statsMap.mirae.stdDev, statsMap.saebom.stdDev];

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "평균 매출(억원)", data: means, backgroundColor: "rgba(59, 130, 246, 0.7)", borderRadius: 6 },
          { label: "중앙값(억원)", data: medians, backgroundColor: "rgba(16, 185, 129, 0.7)", borderRadius: 6 },
          { label: "표준편차(억원)", data: stdDevs, backgroundColor: "rgba(245, 158, 11, 0.7)", borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: { mode: "index", intersect: false }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "억원" } }
        }
      }
    });
  },

  // 2. 분포 및 히스토그램 차트
  renderMethod2(canvasId, distData, companyName, color) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = distData.bins.map(b => b.label);
    const counts = distData.bins.map(b => b.count);

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: `${companyName} 매출 구간별 빈도(개월 수)`,
            data: counts,
            backgroundColor: color || "rgba(59, 130, 246, 0.75)",
            borderColor: color || "#3b82f6",
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              afterLabel: function() {
                return `왜도: ${distData.skewness} | 첨도: ${distData.kurtosis}`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: "매출 구간 (억원)" } },
          y: { beginAtZero: true, stepSize: 1, title: { display: true, text: "빈도 (개월)" } }
        }
      }
    });
  },

  // 3. 사분위 박스플롯 대체형 사분위수 밴드 차트
  renderMethod3(canvasId, boxData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = ["한빛테크", "미래솔루션", "새봄산업"];
    const keys = ["hanbit", "mirae", "saebom"];

    const minData = keys.map(k => boxData[k].min);
    const q1Data = keys.map(k => boxData[k].q1);
    const medianData = keys.map(k => boxData[k].median);
    const q3Data = keys.map(k => boxData[k].q3);
    const maxData = keys.map(k => boxData[k].max);

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "최솟값(Min)", data: minData, backgroundColor: "rgba(148, 163, 184, 0.6)", borderRadius: 4 },
          { label: "1사분위(Q1)", data: q1Data, backgroundColor: "rgba(59, 130, 246, 0.6)", borderRadius: 4 },
          { label: "중앙값(Median)", data: medianData, backgroundColor: "rgba(16, 185, 129, 0.8)", borderRadius: 4 },
          { label: "3사분위(Q3)", data: q3Data, backgroundColor: "rgba(245, 158, 11, 0.6)", borderRadius: 4 },
          { label: "최댓값(Max)", data: maxData, backgroundColor: "rgba(239, 68, 68, 0.6)", borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          y: { beginAtZero: false, min: 5, title: { display: true, text: "매출(억원)" } }
        }
      }
    });
  },

  // 4. 변동계수(CV) 차트
  renderMethod4(canvasId, cvData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["한빛테크", "미래솔루션", "새봄산업"],
        datasets: [
          {
            label: "변동계수 (CV, % = σ / μ)",
            data: [cvData.hanbit, cvData.mirae, cvData.saebom],
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)"
            ],
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "변동계수 (%)" } }
        }
      }
    });
  },

  // 5. OLS 선형 회귀 추세 차트
  renderMethod5(canvasId, rawData, regMap, companyKey) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = rawData.map(d => d.month);
    const actual = rawData.map(d => d[companyKey]);
    const trend = regMap[companyKey].trendValues;
    const meta = COMPANY_META[companyKey];

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${meta.name} 실제 매출`,
            data: actual,
            borderColor: meta.color,
            backgroundColor: meta.bgColor,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.1
          },
          {
            label: `OLS 선형 회귀선 (기울기: ${regMap[companyKey].slope}억/월, R²: ${regMap[companyKey].rSquared})`,
            data: trend,
            borderColor: "#ef4444",
            borderDash: [6, 4],
            borderWidth: 2.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: "매출(억원)" } }
        }
      }
    });
  },

  // 6. CAGR 및 연도별 성장률 콤보 차트
  renderMethod6(canvasId, cagrData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const years = ["2021", "2022", "2023", "2024", "2025"];

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: years,
        datasets: [
          {
            label: `한빛테크 (CAGR ${cagrData.hanbit.cagr}%)`,
            data: years.map(y => cagrData.hanbit.annualTotals[y]),
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderRadius: 6
          },
          {
            label: `미래솔루션 (CAGR ${cagrData.mirae.cagr}%)`,
            data: years.map(y => cagrData.mirae.annualTotals[y]),
            backgroundColor: "rgba(16, 185, 129, 0.75)",
            borderRadius: 6
          },
          {
            label: `새봄산업 (CAGR ${cagrData.saebom.cagr}%)`,
            data: years.map(y => cagrData.saebom.annualTotals[y]),
            backgroundColor: "rgba(245, 158, 11, 0.75)",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { title: { display: true, text: "연간 총매출(억원)" } }
        }
      }
    });
  },

  // 7. 이동평균 (SMA 3M / 6M / 12M) 차트
  renderMethod7(canvasId, rawData, maData, companyKey) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = rawData.map(d => d.month);
    const actual = rawData.map(d => d[companyKey]);
    const meta = COMPANY_META[companyKey];

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${meta.name} 실제 월매출`,
            data: actual,
            borderColor: meta.color,
            borderWidth: 1.5,
            pointRadius: 1,
            tension: 0.1
          },
          {
            label: "3개월 이동평균(3M SMA)",
            data: maData.sma3,
            borderColor: "#8b5cf6",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3
          },
          {
            label: "6개월 이동평균(6M SMA)",
            data: maData.sma6,
            borderColor: "#f59e0b",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3
          },
          {
            label: "12개월 장기이동평균(12M SMA)",
            data: maData.sma12,
            borderColor: "#ef4444",
            borderWidth: 2.5,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: "매출(억원)" } }
        }
      }
    });
  },

  // 8. 지수 평활법(Holt) 및 2026 예측 차트
  renderMethod8(canvasId, rawData, holtMap, companyKey) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const histLabels = rawData.map(d => d.month);
    const forecastMonths = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);
    const labels = [...histLabels, ...forecastMonths];

    const actual = rawData.map(d => d[companyKey]);
    const forecast = holtMap[companyKey].forecast;

    const histActualSeries = [...actual, ...Array(12).fill(null)];
    const forecastSeries = [...Array(actual.length - 1).fill(null), actual[actual.length - 1], ...forecast];

    const meta = COMPANY_META[companyKey];

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${meta.name} 과거 실적 (2021~2025)`,
            data: histActualSeries,
            borderColor: meta.color,
            backgroundColor: meta.bgColor,
            borderWidth: 2,
            pointRadius: 2
          },
          {
            label: `2026년 Holt 예측치 (연말 전망: ${forecast[11]}억원)`,
            data: forecastSeries,
            borderColor: "#ec4899",
            borderDash: [6, 4],
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#ec4899"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 14 } },
          y: { title: { display: true, text: "매출(억원)" } }
        }
      }
    });
  },

  // 9. 월별 계절 지수(Seasonality Index) 차트
  renderMethod9(canvasId, seasonData, companyName) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = seasonData.indices.map(s => s.month);
    const indices = seasonData.indices.map(s => s.index);

    const bgColors = indices.map(val => (val >= 100 ? "rgba(16, 185, 129, 0.75)" : "rgba(239, 68, 68, 0.75)"));

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: `${companyName} 월별 계절 지수 (기준: 100%)`,
            data: indices,
            backgroundColor: bgColors,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 60, max: 140, title: { display: true, text: "계절 지수 (%)" } }
        }
      }
    });
  },

  // 10. 계절성 히트맵 렌더러 (순수 DOM 테이블 그리드)
  renderMethod10(containerId, matrixData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 전체 최솟값, 최댓값 탐색
    let min = Infinity, max = -Infinity;
    matrixData.forEach(row => {
      row.months.forEach(v => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });

    let html = `
      <div class="heatmap-table-wrap">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th>연도</th>
              ${Array.from({ length: 12 }, (_, i) => `<th>${i + 1}월</th>`).join("")}
              <th>연평균</th>
            </tr>
          </thead>
          <tbody>
    `;

    matrixData.forEach(row => {
      const rowAvg = (row.months.reduce((a, b) => a + b, 0) / 12).toFixed(2);
      html += `<tr><td class="font-bold">${row.year}년</td>`;
      row.months.forEach(v => {
        const ratio = (v - min) / (max - min);
        // 청록/파랑 계열 색상 그라데이션
        const alpha = 0.15 + ratio * 0.75;
        const textColor = ratio > 0.55 ? "#ffffff" : "#1e293b";
        html += `<td style="background-color: rgba(59, 130, 246, ${alpha}); color: ${textColor};" title="${row.year}년 ${v}억">${v}</td>`;
      });
      html += `<td class="font-bold">${rowAvg}</td></tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  // 11. 분기별 실적 집계 차트
  renderMethod11(canvasId, quarterData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = quarterData.map(q => q.label);

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "한빛테크",
            data: quarterData.map(q => q.hanbit),
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderRadius: 4
          },
          {
            label: "미래솔루션",
            data: quarterData.map(q => q.mirae),
            backgroundColor: "rgba(16, 185, 129, 0.75)",
            borderRadius: 4
          },
          {
            label: "새봄산업",
            data: quarterData.map(q => q.saebom),
            backgroundColor: "rgba(245, 158, 11, 0.75)",
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 10 } },
          y: { title: { display: true, text: "분기 매출 합계 (억원)" } }
        }
      }
    });
  },

  // 12. 시장 점유율 누적 영역(Stacked Area) 차트
  renderMethod12(canvasId, shareData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = shareData.map(d => d.month);

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "한빛테크 점유율",
            data: shareData.map(d => d.hanbitShare),
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "#3b82f6",
            fill: true,
            pointRadius: 0
          },
          {
            label: "미래솔루션 점유율",
            data: shareData.map(d => d.miraeShare),
            backgroundColor: "rgba(16, 185, 129, 0.5)",
            borderColor: "#10b981",
            fill: true,
            pointRadius: 0
          },
          {
            label: "새봄산업 점유율",
            data: shareData.map(d => d.saebomShare),
            backgroundColor: "rgba(245, 158, 11, 0.5)",
            borderColor: "#f59e0b",
            fill: true,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { stacked: true, min: 0, max: 100, title: { display: true, text: "점유율 (%)" } }
        }
      }
    });
  },

  // 13. 기준 시점 지수화(Base-100) 차트
  renderMethod13(canvasId, base100Data) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = base100Data.map(d => d.month);

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "한빛테크 (기준: 2021-01 = 100)",
            data: base100Data.map(d => d.hanbit),
            borderColor: "#3b82f6",
            borderWidth: 2.5,
            pointRadius: 1,
            tension: 0.2
          },
          {
            label: "미래솔루션 (기준: 2021-01 = 100)",
            data: base100Data.map(d => d.mirae),
            borderColor: "#10b981",
            borderWidth: 2.5,
            pointRadius: 1,
            tension: 0.2
          },
          {
            label: "새봄산업 (기준: 2021-01 = 100)",
            data: base100Data.map(d => d.saebom),
            borderColor: "#f59e0b",
            borderWidth: 2.5,
            pointRadius: 1,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: "지수 (Base 100)" } }
        }
      }
    });
  },

  // 14. 누적 총매출 곡선 차트
  renderMethod14(canvasId, cumData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = cumData.map(d => d.month);

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "한빛테크 누적매출",
            data: cumData.map(d => d.hanbit),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            borderWidth: 2.5,
            pointRadius: 1
          },
          {
            label: "미래솔루션 누적매출",
            data: cumData.map(d => d.mirae),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            borderWidth: 2.5,
            pointRadius: 1
          },
          {
            label: "새봄산업 누적매출",
            data: cumData.map(d => d.saebom),
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            fill: true,
            borderWidth: 2.5,
            pointRadius: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: "누적 매출 합계 (억원)" } }
        }
      }
    });
  },

  // 15. HHI 시장 집중도 지수 차트
  renderMethod15(canvasId, hhiData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = hhiData.map(d => d.month);
    const hhiVals = hhiData.map(d => d.hhi);

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "월별 HHI 지수",
            data: hhiVals,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.15)",
            borderWidth: 2.5,
            fill: true,
            pointRadius: 2
          },
          {
            label: "고도 과점 기준선 (2,500)",
            data: Array(labels.length).fill(2500),
            borderColor: "#ef4444",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0
          },
          {
            label: "중간 집중도 기준선 (1,500)",
            data: Array(labels.length).fill(1500),
            borderColor: "#10b981",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { min: 2800, max: 4000, title: { display: true, text: "HHI 지수 (s₁² + s₂² + s₃²)" } }
        }
      }
    });
  },

  // 16. 상관관계 매트릭스 시각화 (DOM 기반 컬러 매트릭스)
  renderMethod16(containerId, matrix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const names = {
      hanbit: "한빛테크",
      mirae: "미래솔루션",
      saebom: "새봄산업"
    };

    const keys = ["hanbit", "mirae", "saebom"];

    let html = `
      <div class="correlation-table-wrap">
        <table class="correlation-table">
          <thead>
            <tr>
              <th>구분</th>
              ${keys.map(k => `<th>${names[k]}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
    `;

    keys.forEach(k1 => {
      html += `<tr><td class="font-bold">${names[k1]}</td>`;
      keys.forEach(k2 => {
        const r = matrix[k1][k2];
        let bgColor = "rgba(241, 245, 249, 0.8)";
        let fontColor = "#0f172a";

        if (r > 0.7) {
          bgColor = "rgba(59, 130, 246, 0.85)";
          fontColor = "#ffffff";
        } else if (r > 0.4) {
          bgColor = "rgba(59, 130, 246, 0.4)";
        } else if (r < -0.6) {
          bgColor = "rgba(239, 68, 68, 0.85)";
          fontColor = "#ffffff";
        } else if (r < -0.3) {
          bgColor = "rgba(239, 68, 68, 0.4)";
        }

        html += `
          <td style="background-color: ${bgColor}; color: ${fontColor}; font-weight: 700;">
            ${r.toFixed(3)}
          </td>
        `;
      });
      html += `</tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  // 17. 리드-래그 시차 교차 상관 막대 차트
  renderMethod17(canvasId, leadLagData, pairLabel) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = leadLagData.map(d => d.label);
    const corrVals = leadLagData.map(d => d.correlation);

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: `${pairLabel} 시차 교차상관계수 r(k)`,
            data: corrVals,
            backgroundColor: corrVals.map(v => (v >= 0 ? "rgba(59, 130, 246, 0.75)" : "rgba(239, 68, 68, 0.75)")),
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { font: { size: 10 } } },
          y: { min: -1, max: 1, title: { display: true, text: "상관계수 r" } }
        }
      }
    });
  },

  // 18. Z-Score 표준화 및 이상치 탐지 차트
  renderMethod18(canvasId, anomalyData, companyName) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = anomalyData.points.map(p => p.month);
    const zScores = anomalyData.points.map(p => p.zScore);
    const pointColors = anomalyData.points.map(p => (p.isAnomaly ? "#ef4444" : "#3b82f6"));
    const pointRadii = anomalyData.points.map(p => (p.isAnomaly ? 6 : 2));

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${companyName} Z-Score (표준정규화)`,
            data: zScores,
            borderColor: "#3b82f6",
            pointBackgroundColor: pointColors,
            pointRadius: pointRadii,
            borderWidth: 2,
            tension: 0.1
          },
          {
            label: "+2σ 이상치 상한 임계선",
            data: Array(labels.length).fill(2.0),
            borderColor: "#ef4444",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0
          },
          {
            label: "-2σ 이상치 하한 임계선",
            data: Array(labels.length).fill(-2.0),
            borderColor: "#ef4444",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: "Z-Score (σ)" } }
        }
      }
    });
  },

  // 19. 성장률-변동성 포트폴리오 매트릭스 (버블 차트)
  renderMethod19(canvasId, matrixList) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const colors = {
      hanbit: "#3b82f6",
      mirae: "#10b981",
      saebom: "#f59e0b"
    };

    const datasets = matrixList.map(item => ({
      label: item.name,
      data: [
        {
          x: item.cv,
          y: item.cagr,
          r: item.revenue2025 / 10 // 버블 크기
        }
      ],
      backgroundColor: colors[item.company],
      borderColor: colors[item.company],
      borderWidth: 1.5
    }));

    this.instances[canvasId] = new Chart(ctx, {
      type: "bubble",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: function(ctx) {
                const item = matrixList[ctx.datasetIndex];
                return `2025 연매출: ${item.revenue2025}억 | 포지션: ${item.quadrant}`;
              }
            }
          }
        },
        scales: {
          x: { min: 5, max: 30, title: { display: true, text: "변동계수 CV (% - 위험도)" } },
          y: { min: -5, max: 20, title: { display: true, text: "연평균 성장률 CAGR (% - 수익성)" } }
        }
      }
    });
  },

  // 20. 몬테카를로 1,000회 시뮬레이션 팬 차트
  renderMethod20(canvasId, mcData, companyName) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = mcData.summarySteps.map(s => s.month);
    const p95 = mcData.summarySteps.map(s => s.p95);
    const p50 = mcData.summarySteps.map(s => s.p50);
    const p5 = mcData.summarySteps.map(s => s.p5);

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "상위 95% 낙관 시나리오",
            data: p95,
            borderColor: "rgba(16, 185, 129, 0.8)",
            borderDash: [4, 4],
            borderWidth: 2,
            pointRadius: 3,
            fill: false
          },
          {
            label: "중앙값(p50) 기준 시나리오",
            data: p50,
            borderColor: "#3b82f6",
            borderWidth: 3,
            pointRadius: 4,
            fill: false
          },
          {
            label: "하위 5% 비관 시나리오",
            data: p5,
            borderColor: "rgba(239, 68, 68, 0.8)",
            borderDash: [4, 4],
            borderWidth: 2,
            pointRadius: 3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { mode: "index", intersect: false }
        },
        scales: {
          x: { title: { display: true, text: "2026년 예측 월" } },
          y: { title: { display: true, text: "시뮬레이션 매출 전망 (억원)" } }
        }
      }
    });
  }
};
