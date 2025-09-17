// 대시보드 관련 유틸리티 함수들

import { CONFIG } from '../config/dashboardConfig.js'

// 유틸리티 함수들
export const utils = {
  // 고정 숫자 생성 (범위 내) - 목업 데이터를 위해 랜덤 대신 고정값 사용
  randomBetween: (min, max) => (min + max) / 2, // 중간값 반환
  
  // 고정 정수 생성 (범위 내) - 목업 데이터를 위해 랜덤 대신 고정값 사용
  randomInt: (min, max) => Math.floor((min + max) / 2), // 중간값의 정수 반환
  
  // 날짜 계산 유틸리티
  getDateOffset: (offsetDays) => {
    const date = new Date()
    date.setDate(date.getDate() - offsetDays)
    return date.toISOString().split('T')[0]
  },
  
  // 날짜 범위 유효성 검사
  validateDateRange: (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    
    // 시작일이 종료일보다 늦으면 안됨
    if (start > end) return false
    
    // 미래 날짜는 선택할 수 없음
    if (end > today) return false
    
    // 최대 기간 제한 (365일)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > CONFIG.DATE_RANGE.MAX_HISTORICAL_DAYS) return false
    
    return true
  },
  
  // 날짜 범위를 문자열로 포맷
  formatDateRange: (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('ko-KR')
    const end = new Date(endDate).toLocaleDateString('ko-KR')
    return `${start} ~ ${end}`
  },
  
  // 퍼센티지 계산
  calculatePercentage: (value, total) => {
    if (total === 0) return 0
    return parseFloat(((value / total) * 100).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES))
  },
  
  // 변화율 계산
  calculateChangeRate: (current, previous) => {
    if (previous === 0) return 0
    return parseFloat((((current - previous) / previous) * 100).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES))
  },
  
  // 배열을 청크로 나누기
  chunkArray: (array, chunkSize) => {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  },
  
  // 데이터 정렬
  sortData: (data, sortBy, sortDirection = 'asc') => {
    return [...data].sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      // 숫자인 경우
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      // 문자열인 경우
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }
      
      return 0
    })
  },
  
  // 데이터 필터링
  filterData: (data, filters) => {
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined || value === '') continue
        
        if (Array.isArray(value)) {
          if (!value.includes(item[key])) return false
        } else {
          if (item[key] !== value) return false
        }
      }
      return true
    })
  }
}

export default utils