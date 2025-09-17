// 매체별 데이터 생성 유틸리티

import { CONFIG } from '../config/dashboardConfig.js'
import { utils } from './dashboardUtils.js'

// 매체별 기본 데이터 설정
export const getMediaBaseData = (media) => {
  const mediaConfigs = {
    '네이버': { baseImpressions: 8000, multiplier: 1.0 },
    '카카오': { baseImpressions: 6000, multiplier: 0.9 },
    '구글': { baseImpressions: 10000, multiplier: 1.2 },
    '페이스북': { baseImpressions: 7000, multiplier: 1.1 },
    '틱톡': { baseImpressions: 12000, multiplier: 1.3 }
  }
  
  return mediaConfigs[media] || { baseImpressions: 5000, multiplier: 1.0 }
}

// 일별 데이터 생성
export const generateDailyData = (medias, dateRange) => {
  const startDate = new Date(dateRange.startDate)
  const endDate = new Date(dateRange.endDate)
  const data = []
  
  // 날짜별로 데이터 생성
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    
    // 각 매체별 데이터 생성
    medias.forEach(media => {
      const baseData = getMediaBaseData(media)
      const dayVariation = Math.sin(date.getDay() * Math.PI / 7) * 0.3 + 1 // 요일별 변동
      
      const impressions = Math.floor(baseData.baseImpressions * baseData.multiplier * dayVariation)
      const clicks = Math.floor(impressions * utils.randomBetween(
        CONFIG.RANDOM_RANGES.CLICKS.min, 
        CONFIG.RANDOM_RANGES.CLICKS.max
      ))
      const conversions = Math.floor(clicks * utils.randomBetween(
        CONFIG.RANDOM_RANGES.CONVERSIONS.min, 
        CONFIG.RANDOM_RANGES.CONVERSIONS.max
      ))
      const cpc = utils.randomBetween(CONFIG.RANDOM_RANGES.CPC.min, CONFIG.RANDOM_RANGES.CPC.max)
      const cost = clicks * cpc
      const revenue = cost * utils.randomBetween(
        CONFIG.RANDOM_RANGES.REVENUE_MULTIPLIER.min,
        CONFIG.RANDOM_RANGES.REVENUE_MULTIPLIER.max
      )
      
      data.push({
        date: dateStr,
        media,
        impressions,
        clicks,
        conversions,
        cost: Math.round(cost),
        revenue: Math.round(revenue),
        ctr: utils.calculatePercentage(clicks, impressions),
        cpc: Math.round(cpc),
        cpa: conversions > 0 ? Math.round(cost / conversions) : 0,
        roas: cost > 0 ? parseFloat((revenue / cost).toFixed(2)) : 0
      })
    })
  }
  
  return data
}

// 키워드별 데이터 생성 (기존 키워드 데이터와 통합)
export const generateKeywordData = (medias, keywords = []) => {
  if (keywords.length === 0) {
    keywords = ['브랜드명', '제품명', '카테고리', '경쟁사', '일반키워드']
  }
  
  const data = []
  
  keywords.forEach(keyword => {
    medias.forEach(media => {
      const baseData = getMediaBaseData(media)
      const keywordMultiplier = keyword === '브랜드명' ? 1.5 :
                               keyword === '제품명' ? 1.2 :
                               keyword === '카테고리' ? 1.0 :
                               keyword === '경쟁사' ? 0.8 : 0.6
      
      const impressions = Math.floor(baseData.baseImpressions * keywordMultiplier)
      const clicks = Math.floor(impressions * utils.randomBetween(
        CONFIG.RANDOM_RANGES.CLICKS.min, 
        CONFIG.RANDOM_RANGES.CLICKS.max
      ))
      const conversions = Math.floor(clicks * utils.randomBetween(
        CONFIG.RANDOM_RANGES.CONVERSIONS.min, 
        CONFIG.RANDOM_RANGES.CONVERSIONS.max
      ))
      const cpc = utils.randomBetween(CONFIG.RANDOM_RANGES.CPC.min, CONFIG.RANDOM_RANGES.CPC.max)
      const cost = clicks * cpc
      
      data.push({
        keyword,
        media,
        campaign: `${media} ${keyword} 캠페인`,
        adGroup: `${media} ${keyword} 광고그룹`,
        impressions,
        clicks,
        conversions,
        cost: Math.round(cost),
        ctr: utils.calculatePercentage(clicks, impressions),
        cpc: Math.round(cpc),
        cpa: conversions > 0 ? Math.round(cost / conversions) : 0
      })
    })
  })
  
  return data
}

export default {
  getMediaBaseData,
  generateDailyData,
  generateKeywordData
}