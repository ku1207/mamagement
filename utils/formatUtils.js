// 포맷팅 관련 유틸리티 함수들

/**
 * 숫자를 천 단위 구분자와 함께 포맷팅
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} 포맷팅된 문자열
 */
export const formatNumber = (num) => {
  if (num == null || isNaN(num)) return '0'
  return Math.round(num).toLocaleString()
}

/**
 * 통화 형식으로 포맷팅 (₩ 기호 포함)
 * @param {number} amount - 포맷팅할 금액
 * @returns {string} 통화 포맷팅된 문자열
 */
export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₩0'
  return '₩' + Math.round(amount).toLocaleString()
}

/**
 * 퍼센티지 형식으로 포맷팅
 * @param {number} num - 포맷팅할 숫자
 * @param {number} decimals - 소수점 자릿수 (기본값: 2)
 * @returns {string} 퍼센티지 포맷팅된 문자열
 */
export const formatPercentage = (num, decimals = 2) => {
  if (num == null || isNaN(num)) return '0.00%'
  return num.toFixed(decimals) + '%'
}

/**
 * 등락률 포맷팅 (화살표 포함)
 * @param {number} rate - 등락률
 * @returns {Object} 텍스트와 CSS 클래스를 포함한 객체
 */
export const formatChangeRate = (rate) => {
  if (!rate || rate === 0) {
    return { 
      text: '-', 
      className: 'neutral' 
    }
  }
  
  const arrow = rate >= 0 ? '▲' : '▼'
  const className = rate >= 0 ? 'positive' : 'negative'
  
  return {
    text: `${arrow} ${Math.abs(rate).toFixed(1)}%`,
    className
  }
}

/**
 * 큰 숫자를 단위와 함께 간략하게 표시 (예: 1.2K, 3.5M)
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} 간략화된 숫자 문자열
 */
export const formatCompactNumber = (num) => {
  if (num == null || isNaN(num)) return '0'
  
  const absNum = Math.abs(num)
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  
  return num.toString()
}

/**
 * 파일 크기 포맷팅
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷팅된 파일 크기
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatChangeRate,
  formatCompactNumber,
  formatFileSize
}