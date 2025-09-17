// 대시보드 설정 상수들

export const CONFIG = {
  DATA_PERIOD_DAYS: 30,
  DATE_RANGE: {
    DEFAULT_START_OFFSET: 7, // 기본 시작일 (7일 전)
    MAX_HISTORICAL_DAYS: 365
  },
  RANDOM_RANGES: {
    IMPRESSIONS: { min: 1000, max: 100000 },
    CLICKS: { min: 0.01, max: 0.1 }, // 노출수 대비 비율
    CONVERSIONS: { min: 0.01, max: 0.2 }, // 클릭수 대비 비율
    CPC: { min: 100, max: 2000 },
    REVENUE_MULTIPLIER: { min: 1.5, max: 2.5 }, // 비용 대비 수익 배수
    COST_VARIATION: { min: 0.8, max: 1.2 } // 비용 변동 범위
  },
  CHANGE_RATES: {
    DAILY: { min: -15, max: 20 }, // 일일 변동률 범위
    WEEKLY: { min: -10, max: 15 }, // 주간 변동률 범위
    MONTHLY: { min: -8, max: 12 } // 월간 변동률 범위
  },
  DISPLAY: {
    ITEMS_PER_PAGE: 10,
    DECIMAL_PLACES: 1
  }
}

export default CONFIG