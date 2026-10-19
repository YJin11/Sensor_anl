/**
 * 가상기업 3개 5개년 매출 데이터셋 (2021년 1월 ~ 2025년 12월, 총 60개월)
 * 단위: 억원
 * 100% 클라이언트 로컬 메모리 저장 (외부 전송 없음)
 */
const RAW_SALES_DATA = [
  { month: "2021-01", year: 2021, m: 1, hanbit: 8.59, mirae: 7.10, saebom: 10.15 },
  { month: "2021-02", year: 2021, m: 2, hanbit: 9.08, mirae: 7.79, saebom: 10.32 },
  { month: "2021-03", year: 2021, m: 3, hanbit: 10.22, mirae: 7.44, saebom: 9.75 },
  { month: "2021-04", year: 2021, m: 4, hanbit: 9.83, mirae: 7.35, saebom: 9.32 },
  { month: "2021-05", year: 2021, m: 5, hanbit: 9.77, mirae: 7.02, saebom: 8.94 },
  { month: "2021-06", year: 2021, m: 6, hanbit: 9.78, mirae: 6.66, saebom: 8.55 },
  { month: "2021-07", year: 2021, m: 7, hanbit: 9.36, mirae: 6.22, saebom: 8.56 },
  { month: "2021-08", year: 2021, m: 8, hanbit: 8.64, mirae: 6.23, saebom: 8.25 },
  { month: "2021-09", year: 2021, m: 9, hanbit: 8.35, mirae: 6.28, saebom: 8.52 },
  { month: "2021-10", year: 2021, m: 10, hanbit: 7.69, mirae: 6.82, saebom: 9.34 },
  { month: "2021-11", year: 2021, m: 11, hanbit: 9.47, mirae: 8.07, saebom: 10.89 },
  { month: "2021-12", year: 2021, m: 12, hanbit: 10.36, mirae: 8.41, saebom: 11.25 },

  { month: "2022-01", year: 2022, m: 1, hanbit: 10.07, mirae: 8.11, saebom: 10.39 },
  { month: "2022-02", year: 2022, m: 2, hanbit: 10.79, mirae: 8.45, saebom: 9.58 },
  { month: "2022-03", year: 2022, m: 3, hanbit: 11.19, mirae: 8.22, saebom: 9.25 },
  { month: "2022-04", year: 2022, m: 4, hanbit: 11.54, mirae: 7.92, saebom: 8.93 },
  { month: "2022-05", year: 2022, m: 5, hanbit: 11.84, mirae: 7.74, saebom: 8.54 },
  { month: "2022-06", year: 2022, m: 6, hanbit: 10.98, mirae: 7.27, saebom: 8.58 },
  { month: "2022-07", year: 2022, m: 7, hanbit: 10.66, mirae: 7.11, saebom: 7.95 },
  { month: "2022-08", year: 2022, m: 8, hanbit: 9.99, mirae: 6.68, saebom: 8.20 },
  { month: "2022-09", year: 2022, m: 9, hanbit: 9.66, mirae: 6.99, saebom: 8.64 },
  { month: "2022-10", year: 2022, m: 10, hanbit: 9.31, mirae: 7.41, saebom: 9.24 },
  { month: "2022-11", year: 2022, m: 11, hanbit: 10.43, mirae: 8.30, saebom: 10.45 },
  { month: "2022-12", year: 2022, m: 12, hanbit: 11.31, mirae: 9.02, saebom: 11.33 },

  { month: "2023-01", year: 2023, m: 1, hanbit: 11.66, mirae: 8.60, saebom: 9.98 },
  { month: "2023-02", year: 2023, m: 2, hanbit: 12.27, mirae: 9.34, saebom: 9.67 },
  { month: "2023-03", year: 2023, m: 3, hanbit: 12.95, mirae: 8.91, saebom: 9.39 },
  { month: "2023-04", year: 2023, m: 4, hanbit: 13.35, mirae: 8.96, saebom: 9.16 },
  { month: "2023-05", year: 2023, m: 5, hanbit: 13.41, mirae: 8.32, saebom: 8.76 },
  { month: "2023-06", year: 2023, m: 6, hanbit: 12.98, mirae: 7.79, saebom: 7.80 },
  { month: "2023-07", year: 2023, m: 7, hanbit: 11.78, mirae: 7.74, saebom: 8.15 },
  { month: "2023-08", year: 2023, m: 8, hanbit: 11.25, mirae: 7.20, saebom: 8.01 },
  { month: "2023-09", year: 2023, m: 9, hanbit: 11.15, mirae: 7.54, saebom: 8.71 },
  { month: "2023-10", year: 2023, m: 10, hanbit: 10.89, mirae: 7.54, saebom: 8.98 },
  { month: "2023-11", year: 2023, m: 11, hanbit: 12.48, mirae: 9.40, saebom: 10.16 },
  { month: "2023-12", year: 2023, m: 12, hanbit: 13.45, mirae: 9.73, saebom: 10.62 },

  { month: "2024-01", year: 2024, m: 1, hanbit: 13.01, mirae: 9.84, saebom: 9.91 },
  { month: "2024-02", year: 2024, m: 2, hanbit: 14.00, mirae: 9.83, saebom: 9.23 },
  { month: "2024-03", year: 2024, m: 3, hanbit: 15.73, mirae: 10.18, saebom: 8.98 },
  { month: "2024-04", year: 2024, m: 4, hanbit: 15.88, mirae: 9.76, saebom: 8.43 },
  { month: "2024-05", year: 2024, m: 5, hanbit: 15.92, mirae: 9.28, saebom: 8.40 },
  { month: "2024-06", year: 2024, m: 6, hanbit: 15.01, mirae: 8.41, saebom: 7.79 },
  { month: "2024-07", year: 2024, m: 7, hanbit: 13.49, mirae: 8.62, saebom: 8.01 },
  { month: "2024-08", year: 2024, m: 8, hanbit: 13.41, mirae: 7.99, saebom: 7.61 },
  { month: "2024-09", year: 2024, m: 9, hanbit: 12.75, mirae: 8.47, saebom: 7.93 },
  { month: "2024-10", year: 2024, m: 10, hanbit: 12.20, mirae: 8.24, saebom: 8.79 },
  { month: "2024-11", year: 2024, m: 11, hanbit: 14.50, mirae: 9.89, saebom: 10.09 },
  { month: "2024-12", year: 2024, m: 12, hanbit: 15.40, mirae: 10.71, saebom: 10.74 },

  { month: "2025-01", year: 2025, m: 1, hanbit: 14.98, mirae: 10.08, saebom: 9.42 },
  { month: "2025-02", year: 2025, m: 2, hanbit: 16.77, mirae: 10.43, saebom: 9.11 },
  { month: "2025-03", year: 2025, m: 3, hanbit: 18.27, mirae: 10.88, saebom: 8.86 },
  { month: "2025-04", year: 2025, m: 4, hanbit: 18.14, mirae: 10.20, saebom: 8.28 },
  { month: "2025-05", year: 2025, m: 5, hanbit: 17.76, mirae: 10.13, saebom: 7.85 },
  { month: "2025-06", year: 2025, m: 6, hanbit: 16.89, mirae: 9.19, saebom: 7.79 },
  { month: "2025-07", year: 2025, m: 7, hanbit: 15.84, mirae: 9.35, saebom: 7.81 },
  { month: "2025-08", year: 2025, m: 8, hanbit: 14.55, mirae: 8.63, saebom: 7.81 },
  { month: "2025-09", year: 2025, m: 9, hanbit: 13.95, mirae: 8.63, saebom: 8.28 },
  { month: "2025-10", year: 2025, m: 10, hanbit: 14.17, mirae: 9.25, saebom: 8.60 },
  { month: "2025-11", year: 2025, m: 11, hanbit: 16.78, mirae: 10.80, saebom: 9.55 },
  { month: "2025-12", year: 2025, m: 12, hanbit: 17.61, mirae: 11.80, saebom: 10.15 }
];

const COMPANY_META = {
  hanbit: {
    name: "한빛테크",
    color: "#3b82f6", // Blue
    bgColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "#2563eb",
    tag: "고성장 IT/기술 선도기업",
    desc: "연평균 15.2% 고속 성장을 지속하며 2023년부터 시장 점유율 1위를 확고히 굳힌 테크 리더."
  },
  mirae: {
    name: "미래솔루션",
    color: "#10b981", // Emerald Green
    bgColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#059669",
    tag: "안정 성장 B2B 솔루션",
    desc: "연평균 8.7%의 완만하고 흔들림 없는 우상향 실적을 달성한 안정형 포트폴리오 기업."
  },
  saebom: {
    name: "새봄산업",
    color: "#f59e0b", // Amber / Orange
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "#d97706",
    tag: "동계 계절성 전통 제조업",
    desc: "2021년 매출 1위였으나 성숙기 진입 후 연평균 -2.4% 감소세. 11~1월 겨울철 극성수기 뚜렷."
  }
};
