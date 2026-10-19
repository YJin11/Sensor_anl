/**
 * 20가지 정밀 데이터 분석 기법 연산 엔진 (Pure Vanilla JavaScript)
 * 빌드 도구 없이 브라우저에서 100% 로컬 계산 수행
 * 외부 전송 및 서버 통신 0건 (Zero Network Outbound)
 */

const AnalyticsEngine = {
  // 1. 기초 기술통계 요약 (Descriptive Statistics)
  getDescriptiveStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // Variance & StdDev (Sample)
    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);

    // Min, Max
    const min = sorted[0];
    const max = sorted[n - 1];

    // Quartiles
    const q1 = this.getPercentile(sorted, 0.25);
    const q3 = this.getPercentile(sorted, 0.75);
    const iqr = q3 - q1;

    return {
      n,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      variance: Number(variance.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      q1: Number(q1.toFixed(2)),
      q3: Number(q3.toFixed(2)),
      iqr: Number(iqr.toFixed(2))
    };
  },

  getPercentile(sorted, p) {
    const pos = (sorted.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  },

  // 2. 왜도(Skewness) & 첨도(Kurtosis) & 히스토그램 빈 생성
  getDistributionMetrics(values, binCount = 8) {
    const stats = this.getDescriptiveStats(values);
    const n = values.length;
    const m = stats.mean;
    const s = stats.stdDev;

    // Fisher-Pearson Skewness
    const m3 = values.reduce((acc, v) => acc + Math.pow((v - m) / s, 3), 0) / n;
    const skewness = (Math.sqrt(n * (n - 1)) / (n - 2)) * m3;

    // Excess Kurtosis
    const m4 = values.reduce((acc, v) => acc + Math.pow((v - m) / s, 4), 0) / n;
    const kurtosis = ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * m4 - 3 * (n - 1));

    // Bins for Histogram
    const binWidth = (stats.max - stats.min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      rangeStart: stats.min + i * binWidth,
      rangeEnd: stats.min + (i + 1) * binWidth,
      label: `${(stats.min + i * binWidth).toFixed(1)}~${(stats.min + (i + 1) * binWidth).toFixed(1)}`,
      count: 0
    }));

    values.forEach(v => {
      let idx = Math.floor((v - stats.min) / binWidth);
      if (idx >= binCount) idx = binCount - 1;
      if (idx < 0) idx = 0;
      bins[idx].count++;
    });

    return {
      skewness: Number(skewness.toFixed(3)),
      kurtosis: Number(kurtosis.toFixed(3)),
      bins
    };
  },

  // 3. 사분위 박스플롯 지표 (Box Plot Metrics)
  getBoxPlotData(data) {
    const companies = ["hanbit", "mirae", "saebom"];
    const result = {};

    companies.forEach(cKey => {
      const vals = data.map(d => d[cKey]).sort((a, b) => a - b);
      const q1 = this.getPercentile(vals, 0.25);
      const median = this.getPercentile(vals, 0.5);
      const q3 = this.getPercentile(vals, 0.75);
      const iqr = q3 - q1;
      const lowerFence = Math.max(vals[0], q1 - 1.5 * iqr);
      const upperFence = Math.min(vals[vals.length - 1], q3 + 1.5 * iqr);
      const outliers = vals.filter(v => v < lowerFence || v > upperFence);

      result[cKey] = {
        min: Number(vals[0].toFixed(2)),
        q1: Number(q1.toFixed(2)),
        median: Number(median.toFixed(2)),
        q3: Number(q3.toFixed(2)),
        max: Number(vals[vals.length - 1].toFixed(2)),
        lowerFence: Number(lowerFence.toFixed(2)),
        upperFence: Number(upperFence.toFixed(2)),
        outliers: outliers.map(o => Number(o.toFixed(2)))
      };
    });
    return result;
  },

  // 4. 변동계수 (Coefficient of Variation: CV)
  getCV(values) {
    const stats = this.getDescriptiveStats(values);
    const cv = (stats.stdDev / stats.mean) * 100;
    return Number(cv.toFixed(2));
  },

  // 5. OLS 선형 회귀 추세선 (Ordinary Least Squares)
  getLinearRegression(values) {
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i; // 0..n-1
      const y = values[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    const trendValues = [];

    for (let i = 0; i < n; i++) {
      const yPred = intercept + slope * i;
      trendValues.push(Number(yPred.toFixed(2)));
      ssTot += Math.pow(values[i] - yMean, 2);
      ssRes += Math.pow(values[i] - yPred, 2);
    }

    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    return {
      slope: Number(slope.toFixed(4)),
      intercept: Number(intercept.toFixed(2)),
      rSquared: Number(rSquared.toFixed(4)),
      trendValues,
      monthlyDelta: Number(slope.toFixed(2)), // 월평균 증감액
      annualProjectedDelta: Number((slope * 12).toFixed(2)) // 연간 증감 추정치
    };
  },

  // 6. CAGR 및 누적 총 성장률 (Compound Annual Growth Rate)
  getCAGRMetrics(data) {
    const years = [2021, 2022, 2023, 2024, 2025];
    const annualTotals = {};
    const companies = ["hanbit", "mirae", "saebom"];

    companies.forEach(c => {
      annualTotals[c] = {};
      years.forEach(y => {
        const sum = data
          .filter(d => d.year === y)
          .reduce((acc, d) => acc + d[c], 0);
        annualTotals[c][y] = Number(sum.toFixed(2));
      });
    });

    const cagrResult = {};
    companies.forEach(c => {
      const startVal = annualTotals[c][2021];
      const endVal = annualTotals[c][2025];
      const totalGrowth = ((endVal - startVal) / startVal) * 100;
      // 4 periods between 2021 and 2025
      const cagr = (Math.pow(endVal / startVal, 1 / 4) - 1) * 100;

      // YoY 성장률
      const yoy = [];
      for (let i = 1; i < years.length; i++) {
        const prev = annualTotals[c][years[i - 1]];
        const curr = annualTotals[c][years[i]];
        yoy.push({
          period: `${years[i - 1]}→${years[i]}`,
          rate: Number((((curr - prev) / prev) * 100).toFixed(2))
        });
      }

      cagrResult[c] = {
        startVal,
        endVal,
        totalGrowth: Number(totalGrowth.toFixed(2)),
        cagr: Number(cagr.toFixed(2)),
        annualTotals: annualTotals[c],
        yoy
      };
    });

    return cagrResult;
  },

  // 7. 이동평균 (SMA: 3M, 6M, 12M Moving Average)
  getMovingAverages(values, windows = [3, 6, 12]) {
    const result = {};
    windows.forEach(w => {
      const ma = [];
      for (let i = 0; i < values.length; i++) {
        if (i < w - 1) {
          ma.push(null);
        } else {
          let sum = 0;
          for (let j = 0; j < w; j++) {
            sum += values[i - j];
          }
          ma.push(Number((sum / w).toFixed(2)));
        }
      }
      result[`sma${w}`] = ma;
    });
    return result;
  },

  // 8. 지수 평활법(Holt's Linear Exponential Smoothing) 및 2026년 예측
  getHoltForecast(values, forecastMonths = 12, alpha = 0.35, beta = 0.15) {
    const n = values.length;
    let level = values[0];
    let trend = values[1] - values[0];

    const fitted = [level];

    for (let t = 1; t < n; t++) {
      const prevLevel = level;
      const prevTrend = trend;
      level = alpha * values[t] + (1 - alpha) * (prevLevel + prevTrend);
      trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
      fitted.push(Number((level + trend).toFixed(2)));
    }

    const forecast = [];
    for (let m = 1; m <= forecastMonths; m++) {
      const pred = level + m * trend;
      forecast.push(Number(pred.toFixed(2)));
    }

    return {
      fitted,
      forecast,
      finalLevel: Number(level.toFixed(2)),
      finalTrend: Number(trend.toFixed(2))
    };
  },

  // 9. 월별 계절 지수 (Monthly Seasonality Index: 12-Month Multiplicative)
  getSeasonalityIndex(data, companyKey) {
    const monthlyAverages = Array(12).fill(0);
    const monthlyCounts = Array(12).fill(0);

    data.forEach(d => {
      const mIdx = d.m - 1;
      monthlyAverages[mIdx] += d[companyKey];
      monthlyCounts[mIdx]++;
    });

    for (let i = 0; i < 12; i++) {
      monthlyAverages[i] = monthlyAverages[i] / monthlyCounts[i];
    }

    const overallMean = monthlyAverages.reduce((acc, v) => acc + v, 0) / 12;

    const indices = monthlyAverages.map((avg, i) => ({
      month: `${i + 1}월`,
      avgSales: Number(avg.toFixed(2)),
      index: Number(((avg / overallMean) * 100).toFixed(1)),
      deviationPct: Number((((avg - overallMean) / overallMean) * 100).toFixed(1))
    }));

    return {
      overallMean: Number(overallMean.toFixed(2)),
      indices
    };
  },

  // 10. 계절성 히트맵 매트릭스 (5개년 x 12개월 Matrix)
  getHeatmapMatrix(data, companyKey) {
    const years = [2021, 2022, 2023, 2024, 2025];
    const matrix = [];

    years.forEach(y => {
      const yearRow = { year: y, months: [] };
      for (let m = 1; m <= 12; m++) {
        const item = data.find(d => d.year === y && d.m === m);
        yearRow.months.push(item ? item[companyKey] : 0);
      }
      matrix.push(yearRow);
    });

    return matrix;
  },

  // 11. 분기별 실적 집계 (Quarterly Aggregation & QoQ)
  getQuarterlyMetrics(data) {
    const quarters = [];
    const companies = ["hanbit", "mirae", "saebom"];

    for (let y = 2021; y <= 2025; y++) {
      for (let q = 1; q <= 4; q++) {
        const startM = (q - 1) * 3 + 1;
        const endM = q * 3;
        const qData = data.filter(d => d.year === y && d.m >= startM && d.m <= endM);

        const qObj = {
          label: `${y} Q${q}`,
          year: y,
          quarter: q
        };

        companies.forEach(c => {
          const sum = qData.reduce((acc, d) => acc + d[c], 0);
          qObj[c] = Number(sum.toFixed(2));
        });

        quarters.push(qObj);
      }
    }

    return quarters;
  },

  // 12. 시장 점유율 추이 및 누적 점유율 (Market Share Dynamics)
  getMarketShareDynamics(data) {
    return data.map(d => {
      const total = d.hanbit + d.mirae + d.saebom;
      return {
        month: d.month,
        total: Number(total.toFixed(2)),
        hanbitShare: Number(((d.hanbit / total) * 100).toFixed(2)),
        miraeShare: Number(((d.mirae / total) * 100).toFixed(2)),
        saebomShare: Number(((d.saebom / total) * 100).toFixed(2))
      };
    });
  },

  // 13. 기준 시점 지수화 (Base-100 Indexed Comparison: 2021-01 = 100)
  getBase100Index(data) {
    const baseHanbit = data[0].hanbit;
    const baseMirae = data[0].mirae;
    const baseSaebom = data[0].saebom;

    return data.map(d => ({
      month: d.month,
      hanbit: Number(((d.hanbit / baseHanbit) * 100).toFixed(2)),
      mirae: Number(((d.mirae / baseMirae) * 100).toFixed(2)),
      saebom: Number(((d.saebom / baseSaebom) * 100).toFixed(2))
    }));
  },

  // 14. 누적 총매출 곡선 (Cumulative Revenue Curves)
  getCumulativeRevenue(data) {
    let cumHanbit = 0;
    let cumMirae = 0;
    let cumSaebom = 0;

    return data.map(d => {
      cumHanbit += d.hanbit;
      cumMirae += d.mirae;
      cumSaebom += d.saebom;
      return {
        month: d.month,
        hanbit: Number(cumHanbit.toFixed(2)),
        mirae: Number(cumMirae.toFixed(2)),
        saebom: Number(cumSaebom.toFixed(2)),
        total: Number((cumHanbit + cumMirae + cumSaebom).toFixed(2))
      };
    });
  },

  // 15. 시장 집중도 지수 (HHI: Herfindahl-Hirschman Index)
  getHHIMetrics(data) {
    return data.map(d => {
      const total = d.hanbit + d.mirae + d.saebom;
      const s1 = (d.hanbit / total) * 100;
      const s2 = (d.mirae / total) * 100;
      const s3 = (d.saebom / total) * 100;
      const hhi = Math.pow(s1, 2) + Math.pow(s2, 2) + Math.pow(s3, 2);

      let marketType = "경쟁적 시장";
      if (hhi > 2500) marketType = "고도 과점/집중 시장";
      else if (hhi > 1500) marketType = "중간 집중도 시장";

      return {
        month: d.month,
        hhi: Number(hhi.toFixed(1)),
        marketType
      };
    });
  },

  // 16. 피어슨 교차 상관계수 매트릭스 (Pearson Correlation Matrix)
  getCorrelationMatrix(data) {
    const keys = ["hanbit", "mirae", "saebom"];
    const matrix = {};

    keys.forEach(k1 => {
      matrix[k1] = {};
      keys.forEach(k2 => {
        matrix[k1][k2] = this.calcPearson(
          data.map(d => d[k1]),
          data.map(d => d[k2])
        );
      });
    });

    return matrix;
  },

  calcPearson(x, y) {
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - xMean;
      const dy = y[i] - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const r = num / (Math.sqrt(denX) * Math.sqrt(denY));
    return Number(r.toFixed(3));
  },

  // 17. 리드-래그 시차 상관 분석 (Lead-Lag Cross Correlation: -6 to +6)
  getLeadLagCorrelation(data, key1, key2, maxLag = 6) {
    const v1 = data.map(d => d[key1]);
    const v2 = data.map(d => d[key2]);
    const results = [];

    for (let lag = -maxLag; lag <= maxLag; lag++) {
      let x = [];
      let y = [];

      if (lag < 0) {
        // v1 leads v2 by |lag|
        const absL = Math.abs(lag);
        x = v1.slice(0, v1.length - absL);
        y = v2.slice(absL);
      } else if (lag > 0) {
        // v2 leads v1 by lag
        x = v1.slice(lag);
        y = v2.slice(0, v2.length - lag);
      } else {
        x = v1;
        y = v2;
      }

      const r = this.calcPearson(x, y);
      results.push({
        lag,
        correlation: r,
        label: lag < 0 ? `${key1} ${Math.abs(lag)}개월 선행` : lag > 0 ? `${key2} ${lag}개월 선행` : "동일 시점(Lag 0)"
      });
    }

    return results;
  },

  // 18. Z-Score 표준화 및 이상치 탐지 (Anomaly Detection: |Z| > 2.0)
  getAnomalyDetection(data) {
    const companies = ["hanbit", "mirae", "saebom"];
    const anomalies = {};

    companies.forEach(c => {
      const vals = data.map(d => d[c]);
      const stats = this.getDescriptiveStats(vals);
      const points = data.map(d => {
        const z = (d[c] - stats.mean) / stats.stdDev;
        const isAnomaly = Math.abs(z) >= 2.0;
        return {
          month: d.month,
          value: d[c],
          zScore: Number(z.toFixed(2)),
          isAnomaly,
          direction: z >= 2.0 ? "급등(High)" : z <= -2.0 ? "급락(Low)" : "정상(Normal)"
        };
      });

      anomalies[c] = {
        mean: stats.mean,
        stdDev: stats.stdDev,
        thresholdUpper: Number((stats.mean + 2 * stats.stdDev).toFixed(2)),
        thresholdLower: Number((stats.mean - 2 * stats.stdDev).toFixed(2)),
        points,
        outlierList: points.filter(p => p.isAnomaly)
      };
    });

    return anomalies;
  },

  // 19. 성장률 vs 변동성 리스크-수익 포트폴리오 매트릭스 (Growth-Risk Matrix)
  getGrowthRiskMatrix(data) {
    const cagrData = this.getCAGRMetrics(data);
    const companies = ["hanbit", "mirae", "saebom"];

    return companies.map(c => {
      const vals = data.map(d => d[c]);
      const cv = this.getCV(vals);
      const cagr = cagrData[c].cagr;
      const latestRevenue = cagrData[c].endVal;

      let quadrant = "";
      if (cagr > 10 && cv > 15) quadrant = "고성장-고변동성 (스타 공격주)";
      else if (cagr > 5 && cv <= 18) quadrant = "안정성장-저변동성 (핵심 캐시카우)";
      else quadrant = "역성장/방어형 (체질 개선 필요)";

      return {
        company: c,
        name: COMPANY_META[c].name,
        cagr,
        cv,
        revenue2025: latestRevenue,
        quadrant
      };
    });
  },

  // 20. 몬테카를로 1,000회 시뮬레이션 기반 2026년 확률적 예측 (Monte Carlo Simulation)
  getMonteCarloForecast(data, companyKey, iterations = 1000, forecastSteps = 12) {
    const vals = data.map(d => d[companyKey]);
    // 월별 변화율(Monthly Log Returns) 계산
    const returns = [];
    for (let i = 1; i < vals.length; i++) {
      returns.push(Math.log(vals[i] / vals[i - 1]));
    }

    const retMean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const retVariance = returns.reduce((a, b) => a + Math.pow(b - retMean, 2), 0) / (returns.length - 1);
    const retStd = Math.sqrt(retVariance);

    const lastVal = vals[vals.length - 1];
    const allPaths = [];

    // Box-Muller 변환으로 표준정규 난수 생성
    function randomNormal() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    for (let iter = 0; iter < iterations; iter++) {
      const path = [lastVal];
      let curr = lastVal;
      for (let s = 1; s <= forecastSteps; s++) {
        const rand = randomNormal();
        const drift = retMean - 0.5 * retVariance;
        const shock = retStd * rand;
        curr = curr * Math.exp(drift + shock);
        path.push(curr);
      }
      allPaths.push(path);
    }

    // 각 예측 월별 백분위수 (5th, 50th, 95th percentile) 계산
    const summarySteps = [];
    for (let s = 1; s <= forecastSteps; s++) {
      const stepVals = allPaths.map(p => p[s]).sort((a, b) => a - b);
      const p5 = this.getPercentile(stepVals, 0.05);
      const p50 = this.getPercentile(stepVals, 0.50);
      const p95 = this.getPercentile(stepVals, 0.95);
      summarySteps.push({
        step: s,
        month: `2026-${String(s).padStart(2, "0")}`,
        p5: Number(p5.toFixed(2)),
        p50: Number(p50.toFixed(2)),
        p95: Number(p95.toFixed(2))
      });
    }

    return {
      lastVal,
      retMean: Number(retMean.toFixed(4)),
      retStd: Number(retStd.toFixed(4)),
      summarySteps
    };
  }
};
