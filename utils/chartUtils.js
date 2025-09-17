// 차트 데이터 처리 유틸리티

import { PLATFORM_LABELS, PLATFORM_COLORS } from '../config/chartConfig'

// 지표별 값 계산
export const getMetricValue = (item, selectedMetric) => {
  switch (selectedMetric) {
    case 'impressions':
      return item.impressions || 0
    case 'clicks':
      return item.clicks || 0
    case 'conversions':
      return item.conversions || 0
    case 'cost':
      return item.cost || 0
    case 'ctr':
      return item.impressions > 0 ? parseFloat(((item.clicks / item.impressions) * 100).toFixed(1)) : 0
    case 'cpc':
      return item.clicks > 0 ? Math.round(item.cost / item.clicks) : 0
    case 'cpa':
      return item.conversions > 0 ? (item.cost / item.conversions) : 0
    case 'roas':
      return item.cost > 0 ? (item.revenue / item.cost) : 0
    default:
      return 0
  }
}

// 차트 데이터 가공
export const processChartData = (data, selectedMetric) => {
  if (!data || data.length === 0) return []

  // 날짜별로 그룹화하고 매체별로 합계 계산
  const groupedData = data.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) {
      acc[date] = {
        date,
        naver: 0,
        kakao: 0,
        google: 0,
        facebook: 0,
        tiktok: 0
      }
    }
    
    const value = getMetricValue(item, selectedMetric)
    acc[date][item.platform] += value
    return acc
  }, {})

  return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date))
}

// 원형 차트용 데이터 생성
export const processPieData = (data, selectedMetric) => {
  if (!data || data.length === 0) return []
  
  const platformTotals = data.reduce((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = 0
    
    const value = getMetricValue(item, selectedMetric)
    acc[item.platform] += value
    return acc
  }, {})

  return Object.entries(platformTotals).map(([platform, value]) => ({
    name: PLATFORM_LABELS[platform],
    value,
    color: PLATFORM_COLORS[platform]
  }))
}

// 값 포맷팅
export const formatChartValue = (value, selectedMetric) => {
  if (selectedMetric === 'cost' || selectedMetric === 'cpc' || selectedMetric === 'cpa') {
    return '₩' + value.toLocaleString()
  } else if (selectedMetric === 'ctr') {
    return value.toFixed(1) + '%'
  } else if (selectedMetric === 'roas') {
    return value.toFixed(2)
  }
  return value.toLocaleString()
}