// 데이터 계산 관련 유틸리티 함수들

/**
 * 기간별 합산 정보를 계산
 * @param {Array} data - 키워드 데이터 배열
 * @returns {Object} 기간별 합산 정보 객체
 */
export const calculatePeriodSummary = (data) => {
  if (!data || data.length === 0) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalCostToday: 0,
      totalCostYesterday: 0,
      totalCost7Days: 0,
      totalCostLastWeek: 0,
      avgCtr: 0,
      avgCpc: 0,
      avgCpa: 0,
      costChangeRate: 0,
      cpcChangeRate: 0,
      conversionChangeRate: 0,
      cpaChangeRate: 0,
      ctrChangeRate: 0
    }
  }

  // 기본 합산값 계산
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0)
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)
  const totalCostToday = data.reduce((sum, item) => sum + item.cost_today, 0)
  const totalCostYesterday = data.reduce((sum, item) => sum + item.cost_yesterday, 0)
  const totalCost7Days = data.reduce((sum, item) => sum + item.cost_7days, 0)
  const totalCostLastWeek = data.reduce((sum, item) => sum + item.cost_last_week, 0)

  // 전환수 계산 (클릭수의 일정 비율로 가정)
  const totalConversions = Math.floor(totalClicks * 0.12) // 12%로 가정
  const totalConversionsYesterday = Math.floor(totalClicks * 0.10) // 10%로 가정

  // 평균값 계산
  const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0
  const avgCtrYesterday = totalImpressions > 0 ? parseFloat(((totalClicks * 0.96 / totalImpressions) * 100).toFixed(2)) : 0
  
  const avgCpc = totalClicks > 0 ? Math.round(totalCostToday / totalClicks) : 0
  const avgCpcYesterday = totalClicks > 0 ? Math.round(totalCostYesterday / totalClicks) : 0
  
  const avgCpa = totalConversions > 0 ? Math.round(totalCostToday / totalConversions) : 0
  const avgCpaYesterday = totalConversionsYesterday > 0 ? Math.round(totalCostYesterday / totalConversionsYesterday) : 0

  // 등락률 계산
  const costChangeRate = totalCostYesterday > 0 ? ((totalCostToday - totalCostYesterday) / totalCostYesterday * 100) : 0
  const cpcChangeRate = avgCpcYesterday > 0 ? ((avgCpc - avgCpcYesterday) / avgCpcYesterday * 100) : 0
  const conversionChangeRate = totalConversionsYesterday > 0 ? ((totalConversions - totalConversionsYesterday) / totalConversionsYesterday * 100) : 0
  const cpaChangeRate = avgCpaYesterday > 0 ? ((avgCpa - avgCpaYesterday) / avgCpaYesterday * 100) : 0
  const ctrChangeRate = avgCtrYesterday > 0 ? ((avgCtr - avgCtrYesterday) / avgCtrYesterday * 100) : 0

  return {
    totalImpressions,
    totalClicks,
    totalCostToday,
    totalCostYesterday,
    totalCost7Days,
    totalCostLastWeek,
    totalConversions,
    totalConversionsYesterday,
    avgCtr,
    avgCtrYesterday,
    avgCpc,
    avgCpcYesterday,
    avgCpa,
    avgCpaYesterday,
    costChangeRate: parseFloat(costChangeRate.toFixed(1)),
    cpcChangeRate: parseFloat(cpcChangeRate.toFixed(1)),
    conversionChangeRate: parseFloat(conversionChangeRate.toFixed(1)),
    cpaChangeRate: parseFloat(cpaChangeRate.toFixed(1)),
    ctrChangeRate: parseFloat(ctrChangeRate.toFixed(1)),
    conversionRate: totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2)) : 0,
    roas: totalCostToday > 0 ? parseFloat((totalConversions * 50000 / totalCostToday).toFixed(2)) : 0 // 가정: 전환당 50,000원 수익
  }
}

/**
 * 매체별 키워드 데이터를 생성 (확장 행용)
 * @param {string} keyword - 키워드명
 * @param {Array} medias - 매체 배열
 * @returns {Array} 매체별 데이터 배열
 */
export const generateMediaKeywordData = (keyword, medias = ['네이버', '카카오', '구글', '메타', '틱톡']) => {
  const mockDataMap = {
    '네이버': {
      impressions: 15000, clicks: 750, ctr: 5.0,
      cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322,
      cost_today: 80000, cost_yesterday: 78000, cost_7days: 320000, cost_last_week: 325000
    },
    '카카오': {
      impressions: 10000, clicks: 500, ctr: 5.0,
      cpc_today: 380, cpc_yesterday: 375, cpc_7days: 378, cpc_last_week: 382,
      cost_today: 60000, cost_yesterday: 58000, cost_7days: 240000, cost_last_week: 245000
    },
    '구글': {
      impressions: 12000, clicks: 600, ctr: 5.0,
      cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352,
      cost_today: 70000, cost_yesterday: 69000, cost_7days: 280000, cost_last_week: 285000
    },
    '메타': {
      impressions: 8000, clicks: 400, ctr: 5.0,
      cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402,
      cost_today: 50000, cost_yesterday: 48000, cost_7days: 200000, cost_last_week: 205000
    },
    '틱톡': {
      impressions: 50000, clicks: 2500, ctr: 5.0,
      cpc_today: 180, cpc_yesterday: 175, cpc_7days: 178, cpc_last_week: 182,
      cost_today: 150000, cost_yesterday: 148000, cost_7days: 600000, cost_last_week: 605000
    }
  }

  return medias.map(media => ({
    media,
    keyword,
    campaign: `${media} ${keyword} 캠페인`,
    adGroup: `${media} ${keyword} 광고그룹`,
    ...mockDataMap[media]
  }))
}

/**
 * 전환수 계산
 * @param {number} clicks - 클릭수
 * @param {number} rate - 전환율 (기본 0.12)
 * @returns {number} 전환수
 */
export const calculateConversions = (clicks, rate = 0.12) => {
  return Math.floor(clicks * rate)
}

/**
 * CPA 계산
 * @param {number} cost - 광고비
 * @param {number} conversions - 전환수
 * @returns {number} CPA
 */
export const calculateCPA = (cost, conversions) => {
  return conversions > 0 ? Math.floor(cost / conversions) : 0
}

/**
 * CTR 계산
 * @param {number} clicks - 클릭수
 * @param {number} impressions - 노출수
 * @returns {number} CTR (%)
 */
export const calculateCTR = (clicks, impressions) => {
  return impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0
}

/**
 * CPC 계산
 * @param {number} cost - 광고비
 * @param {number} clicks - 클릭수
 * @returns {number} CPC
 */
export const calculateCPC = (cost, clicks) => {
  return clicks > 0 ? Math.round(cost / clicks) : 0
}

/**
 * 등락률 계산
 * @param {number} current - 현재값
 * @param {number} previous - 이전값
 * @returns {number} 등락률 (%)
 */
export const calculateChangeRate = (current, previous) => {
  return previous > 0 ? parseFloat(((current - previous) / previous * 100).toFixed(1)) : 0
}

export default {
  calculatePeriodSummary,
  generateMediaKeywordData,
  calculateConversions,
  calculateCPA,
  calculateCTR,
  calculateCPC,
  calculateChangeRate
}