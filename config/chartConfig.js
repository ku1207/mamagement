// 차트 설정 및 상수

export const CHART_METRICS = [
  { value: 'impressions', label: '노출수' },
  { value: 'clicks', label: '클릭수' },
  { value: 'conversions', label: '전환수' },
  { value: 'cost', label: '비용' },
  { value: 'ctr', label: 'CTR (%)' },
  { value: 'cpc', label: 'CPC' },
  { value: 'cpa', label: 'CPA' },
  { value: 'roas', label: 'ROAS' }
]

export const CHART_TYPES = [
  { value: 'line', label: '선형 차트' },
  { value: 'bar', label: '막대 차트' },
  { value: 'area', label: '영역 차트' },
  { value: 'pie', label: '원형 차트' }
]

export const PLATFORM_COLORS = {
  naver: '#1EC800',
  kakao: '#FFE812',
  google: '#4285F4',
  facebook: '#1877F2',
  tiktok: '#FF0050'
}

export const PLATFORM_LABELS = {
  naver: '네이버',
  kakao: '카카오',
  google: '구글',
  facebook: '페이스북',
  tiktok: '틱톡'
}

export const DEFAULT_VISIBLE_PLATFORMS = {
  naver: true,
  kakao: true,
  google: true,
  facebook: true,
  tiktok: true
}

export const CHART_COMMON_PROPS = {
  width: '100%',
  height: 400,
  margin: { top: 20, right: 30, left: 20, bottom: 5 }
}