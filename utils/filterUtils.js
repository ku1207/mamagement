// 데이터 필터링 관련 유틸리티 함수들

/**
 * 선택된 매체로 데이터 필터링
 * @param {Array} data - 원본 데이터 배열
 * @param {Array} selectedMedias - 선택된 매체 배열
 * @returns {Array} 필터링된 데이터 배열
 */
export const filterByMedias = (data, selectedMedias) => {
  return data.filter(item => selectedMedias.includes(item.media))
}

/**
 * 광고비 범위로 데이터 필터링
 * @param {Array} data - 원본 데이터 배열
 * @param {number} minCost - 최소 광고비
 * @param {number} maxCost - 최대 광고비
 * @returns {Array} 필터링된 데이터 배열
 */
export const filterByCostRange = (data, minCost, maxCost) => {
  let result = [...data]
  
  if (minCost && !isNaN(minCost)) {
    result = result.filter(item => item.cost_today >= parseInt(minCost))
  }
  
  if (maxCost && !isNaN(maxCost)) {
    result = result.filter(item => item.cost_today <= parseInt(maxCost))
  }
  
  return result
}

/**
 * 지표에 따른 데이터 정렬
 * @param {Array} data - 원본 데이터 배열
 * @param {string} metric - 정렬 기준 지표 ('광고비', '클릭수', 'CPC')
 * @param {string} order - 정렬 순서 ('내림차순', '오름차순')
 * @returns {Array} 정렬된 데이터 배열
 */
export const sortByMetric = (data, metric, order) => {
  const result = [...data]
  
  switch (metric) {
    case '광고비':
      result.sort((a, b) => {
        return order === '내림차순' ? b.cost_today - a.cost_today : a.cost_today - b.cost_today
      })
      break
    case '클릭수':
      result.sort((a, b) => {
        const primarySort = order === '내림차순' ? b.clicks - a.clicks : a.clicks - b.clicks
        // 같은 값일 경우 당일 광고비로 2차 정렬
        if (a.clicks === b.clicks) {
          return b.cost_today - a.cost_today
        }
        return primarySort
      })
      break
    case 'CPC':
      result.sort((a, b) => {
        const primarySort = order === '내림차순' ? b.cpc_today - a.cpc_today : a.cpc_today - b.cpc_today
        // 같은 값일 경우 당일 광고비로 2차 정렬
        if (a.cpc_today === b.cpc_today) {
          return b.cost_today - a.cost_today
        }
        return primarySort
      })
      break
    default:
      // 기본 정렬: 당일 광고비 기준 내림차순
      result.sort((a, b) => b.cost_today - a.cost_today)
  }
  
  return result
}

/**
 * 키워드 개수 제한 적용
 * @param {Array} data - 원본 데이터 배열
 * @param {number} limit - 제한할 개수
 * @returns {Array} 제한된 데이터 배열
 */
export const limitKeywordCount = (data, limit) => {
  if (limit && parseInt(limit) > 0) {
    return data.slice(0, parseInt(limit))
  }
  return data
}

/**
 * 전체 필터링 로직 적용
 * @param {Object} params - 필터링 파라미터
 * @param {Array} params.data - 원본 데이터
 * @param {Array} params.selectedMedias - 선택된 매체
 * @param {string} params.metric - 정렬 기준
 * @param {string} params.order - 정렬 순서
 * @param {string} params.count - 키워드 개수
 * @param {string} params.minCost - 최소 광고비
 * @param {string} params.maxCost - 최대 광고비
 * @returns {Array} 필터링된 최종 데이터
 */
export const applyFilters = (params) => {
  const {
    data,
    selectedMedias,
    metric,
    order,
    count,
    minCost,
    maxCost
  } = params
  
  let result = [...data]
  
  // 1. 매체 필터링
  result = filterByMedias(result, selectedMedias)
  
  // 2. CPC 선택 시 광고비 범위 필터링
  if (metric === 'CPC') {
    result = filterByCostRange(result, minCost, maxCost)
  }
  
  // 3. 정렬 적용
  result = sortByMetric(result, metric, order)
  
  // 4. 개수 제한 적용
  result = limitKeywordCount(result, count)
  
  return result
}

export default {
  filterByMedias,
  filterByCostRange,
  sortByMetric,
  limitKeywordCount,
  applyFilters
}