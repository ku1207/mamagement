// 키워드 데이터 생성 및 처리 로직

/**
 * 키워드 고정 더미 데이터 생성
 * @returns {Array} 키워드 데이터 배열
 */
export const generateKeywordData = () => {
  const baseKeywordData = [
    { keyword: '브랜드명', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 15420, clicks: 847, ctr: 5.49, cpc_today: 325, cpc_yesterday: 318, cpc_7days: 321, cpc_last_week: 329, cost_today: 275075, cost_yesterday: 269246, cost_7days: 271827, cost_last_week: 278763 },
    { keyword: '브랜드명', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 12890, clicks: 632, ctr: 4.90, cpc_today: 367, cpc_yesterday: 351, cpc_7days: 356, cpc_last_week: 361, cost_today: 231944, cost_yesterday: 221832, cost_7days: 224992, cost_last_week: 228152 },
    { keyword: '브랜드명', media: '카카오', campaign: '카카오 브랜드 캠페인', adGroup: '카카오 브랜드 키워드', impressions: 10760, clicks: 523, ctr: 4.86, cpc_today: 394, cpc_yesterday: 381, cpc_7days: 385, cpc_last_week: 392, cost_today: 206062, cost_yesterday: 199263, cost_7days: 201355, cost_last_week: 205016 },
    { keyword: '브랜드명', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 8340, clicks: 417, ctr: 5.00, cpc_today: 412, cpc_yesterday: 398, cpc_7days: 405, cpc_last_week: 416, cost_today: 171804, cost_yesterday: 165966, cost_7days: 168885, cost_last_week: 173472 },
    { keyword: '브랜드명', media: '틱톡', campaign: '틱톡 브랜드 캠페인', adGroup: '틱톡 브랜드 키워드', impressions: 52680, clicks: 2634, ctr: 5.00, cpc_today: 187, cpc_yesterday: 181, cpc_7days: 184, cpc_last_week: 189, cost_today: 492558, cost_yesterday: 476754, cost_7days: 484656, cost_last_week: 497826 },
    
    { keyword: '제품명', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 18000, clicks: 900, ctr: 5.00, cpc_today: 280, cpc_yesterday: 275, cpc_7days: 278, cpc_last_week: 282, cost_today: 252000, cost_yesterday: 247500, cost_7days: 250200, cost_last_week: 253800 },
    { keyword: '제품명', media: '카카오', campaign: '카카오 제품 캠페인', adGroup: '카카오 제품 키워드', impressions: 14000, clicks: 700, ctr: 5.00, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 210000, cost_yesterday: 206500, cost_7days: 208600, cost_last_week: 211400 },
    { keyword: '제품명', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 11000, clicks: 550, ctr: 5.00, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 176000, cost_yesterday: 173250, cost_7days: 174900, cost_last_week: 177100 },
    { keyword: '제품명', media: '메타', campaign: '메타 제품 캠페인', adGroup: '메타 제품 키워드', impressions: 9000, clicks: 450, ctr: 5.00, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 157500, cost_yesterday: 155250, cost_7days: 156600, cost_last_week: 158400 },
    { keyword: '제품명', media: '틱톡', campaign: '틱톡 제품 캠페인', adGroup: '틱톡 제품 키워드', impressions: 45000, clicks: 2250, ctr: 5.00, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 450000, cost_yesterday: 438750, cost_7days: 445500, cost_last_week: 454500 },
    
    { keyword: '카테고리', media: '구글', campaign: '구글 카테고리 캠페인', adGroup: '구글 핵심 키워드', impressions: 20000, clicks: 1000, ctr: 5.00, cpc_today: 250, cpc_yesterday: 245, cpc_7days: 248, cpc_last_week: 252, cost_today: 250000, cost_yesterday: 245000, cost_7days: 248000, cost_last_week: 252000 },
    { keyword: '카테고리', media: '메타', campaign: '메타 카테고리 캠페인', adGroup: '메타 핵심 키워드', impressions: 16000, clicks: 800, ctr: 5.00, cpc_today: 275, cpc_yesterday: 270, cpc_7days: 273, cpc_last_week: 277, cost_today: 220000, cost_yesterday: 216000, cost_7days: 218400, cost_last_week: 221600 },
    { keyword: '카테고리', media: '네이버', campaign: '네이버 카테고리 캠페인', adGroup: '네이버 핵심 키워드', impressions: 13000, clicks: 650, ctr: 5.00, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 188500, cost_yesterday: 185250, cost_7days: 187200, cost_last_week: 189800 },
    { keyword: '카테고리', media: '카카오', campaign: '카카오 카테고리 캠페인', adGroup: '카카오 핵심 키워드', impressions: 11000, clicks: 550, ctr: 5.00, cpc_today: 310, cpc_yesterday: 305, cpc_7days: 308, cpc_last_week: 312, cost_today: 170500, cost_yesterday: 167750, cost_7days: 169400, cost_last_week: 171600 },
    { keyword: '카테고리', media: '틱톡', campaign: '틱톡 카테고리 캠페인', adGroup: '틱톡 카테고리 키워드', impressions: 40000, clicks: 2000, ctr: 5.00, cpc_today: 170, cpc_yesterday: 165, cpc_7days: 168, cpc_last_week: 172, cost_today: 340000, cost_yesterday: 330000, cost_7days: 336000, cost_last_week: 344000 },
    
    { keyword: '경쟁사', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 10000, clicks: 500, ctr: 5.00, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 200000, cost_yesterday: 197500, cost_7days: 199000, cost_last_week: 201000 },
    { keyword: '경쟁사', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 8000, clicks: 400, ctr: 5.00, cpc_today: 420, cpc_yesterday: 415, cpc_7days: 418, cpc_last_week: 422, cost_today: 168000, cost_yesterday: 166000, cost_7days: 167200, cost_last_week: 168800 },
    
    { keyword: '일반키워드', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 22000, clicks: 1100, ctr: 5.00, cpc_today: 230, cpc_yesterday: 225, cpc_7days: 228, cpc_last_week: 232, cost_today: 253000, cost_yesterday: 247500, cost_7days: 250800, cost_last_week: 255200 },
    { keyword: '일반키워드', media: '카카오', campaign: '카카오 제품 캠페인', adGroup: '카카오 제품 키워드', impressions: 13000, clicks: 650, ctr: 5.00, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 169000, cost_yesterday: 165750, cost_7days: 167700, cost_last_week: 170300 },
    
    { keyword: '롱테일키워드', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 8000, clicks: 400, ctr: 5.00, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 140000, cost_yesterday: 138000, cost_7days: 139200, cost_last_week: 140800 },
    
    { keyword: '상품후기', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 12000, clicks: 600, ctr: 5.00, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 180000, cost_yesterday: 177000, cost_7days: 178800, cost_last_week: 181200 },
    
    { keyword: '가격비교', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 17000, clicks: 850, ctr: 5.00, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 246500, cost_yesterday: 242250, cost_7days: 244800, cost_last_week: 248200 },
    { keyword: '가격비교', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 11000, clicks: 550, ctr: 5.00, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 176000, cost_yesterday: 173250, cost_7days: 174900, cost_last_week: 177100 },
    
    { keyword: '이벤트', media: '카카오', campaign: '카카오 카테고리 캠페인', adGroup: '카카오 핵심 키워드', impressions: 25000, clicks: 1250, ctr: 5.00, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 250000, cost_yesterday: 243750, cost_7days: 247500, cost_last_week: 252500 },
    
    { keyword: '할인', media: '메타', campaign: '메타 제품 캠페인', adGroup: '메타 제품 키워드', impressions: 19000, clicks: 950, ctr: 5.00, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 247000, cost_yesterday: 242250, cost_7days: 245100, cost_last_week: 248900 },
    
    // 틱톡 전용 키워드 데이터 추가
    { keyword: '챌린지', media: '틱톡', campaign: '틱톡 바이럴 챌린지', adGroup: '틱톡 해시태그 키워드', impressions: 80000, clicks: 4000, ctr: 5.00, cpc_today: 150, cpc_yesterday: 145, cpc_7days: 148, cpc_last_week: 152, cost_today: 600000, cost_yesterday: 580000, cost_7days: 592000, cost_last_week: 608000 },
    { keyword: '댄스', media: '틱톡', campaign: '틱톡 댄스 챌린지', adGroup: '틱톡 댄스 키워드', impressions: 75000, clicks: 3750, ctr: 5.00, cpc_today: 160, cpc_yesterday: 155, cpc_7days: 158, cpc_last_week: 162, cost_today: 600000, cost_yesterday: 581250, cost_7days: 592500, cost_last_week: 607500 },
    { keyword: '트렌드', media: '틱톡', campaign: '틱톡 트렌드 마케팅', adGroup: '틱톡 트렌드 키워드', impressions: 60000, clicks: 3000, ctr: 5.00, cpc_today: 190, cpc_yesterday: 185, cpc_7days: 188, cpc_last_week: 192, cost_today: 570000, cost_yesterday: 555000, cost_7days: 564000, cost_last_week: 576000 },
    { keyword: '바이럴', media: '틱톡', campaign: '틱톡 바이럴 마케팅', adGroup: '틱톡 바이럴 키워드', impressions: 65000, clicks: 3250, ctr: 5.00, cpc_today: 175, cpc_yesterday: 170, cpc_7days: 173, cpc_last_week: 177, cost_today: 568750, cost_yesterday: 552500, cost_7days: 562250, cost_last_week: 575250 },
    { keyword: '인플루언서', media: '틱톡', campaign: '틱톡 인플루언서 콜라보', adGroup: '틱톡 인플루언서 키워드', impressions: 55000, clicks: 2750, ctr: 5.00, cpc_today: 210, cpc_yesterday: 205, cpc_7days: 208, cpc_last_week: 212, cost_today: 577500, cost_yesterday: 563750, cost_7days: 572000, cost_last_week: 583000 }
  ]
  
  // 각 데이터에 당월/전월 필드 추가
  const fixedKeywordData = baseKeywordData.map(item => ({
    ...item,
    // CPC 당월/전월
    cpc_current_month: Math.round(item.cpc_today * 0.97),
    cpc_last_month: Math.round(item.cpc_today * 1.05),
    
    // 광고비 당월/전월
    cost_current_month: Math.round(item.cost_today * 31 * 0.98),
    cost_last_month: Math.round(item.cost_today * 31 * 1.03),
    
    // 전환수 당월/전월
    conversions_current_month: Math.round(item.clicks * 0.12 * 31 * 0.95),
    conversions_last_month: Math.round(item.clicks * 0.10 * 31 * 1.02),
    
    // CPA 당월/전월 (광고비/전환수)
    get cpa_current_month() {
      return Math.round(this.cost_current_month / this.conversions_current_month)
    },
    get cpa_last_month() {
      return Math.round(this.cost_last_month / this.conversions_last_month)
    }
  }))
  
  return fixedKeywordData
}

/**
 * 실제 API 호출 시 사용할 함수 (미래 구현용)
 * @param {Object} params - API 호출 파라미터
 * @returns {Promise<Array>} 키워드 데이터
 */
export const fetchKeywordData = async (params) => {
  // 실제 구현 시 API 호출 로직
  // const response = await fetch('/api/keywords', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(params)
  // })
  // return response.json()
  
  // 현재는 더미 데이터 반환
  return Promise.resolve(generateKeywordData())
}

/**
 * 키워드 데이터 검증
 * @param {Array} data - 검증할 데이터
 * @returns {boolean} 검증 결과
 */
export const validateKeywordData = (data) => {
  if (!Array.isArray(data)) return false
  
  return data.every(item => {
    return (
      typeof item.keyword === 'string' &&
      typeof item.media === 'string' &&
      typeof item.campaign === 'string' &&
      typeof item.adGroup === 'string' &&
      typeof item.impressions === 'number' &&
      typeof item.clicks === 'number' &&
      typeof item.ctr === 'number' &&
      typeof item.cpc_today === 'number' &&
      typeof item.cost_today === 'number'
    )
  })
}

export default {
  generateKeywordData,
  fetchKeywordData,
  validateKeywordData
}