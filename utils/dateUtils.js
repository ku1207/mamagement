// 날짜 관련 유틸리티 함수들

/**
 * 로컬 시간 기준으로 YYYY-MM-DD 형식으로 날짜를 변환
 * @param {Date} date - 변환할 날짜 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 현재 날짜를 기준으로 어제 날짜를 반환
 * @returns {Date} 어제 날짜 객체
 */
export const getYesterday = () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

/**
 * 현재 날짜를 기준으로 7일 전 날짜를 반환
 * @returns {Date} 7일 전 날짜 객체
 */
export const getSevenDaysAgo = () => {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return sevenDaysAgo
}

/**
 * 현재 날짜를 기준으로 지난주 같은 요일 날짜를 반환
 * @returns {Date} 지난주 같은 요일 날짜 객체
 */
export const getLastWeekSameDay = () => {
  const today = new Date()
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  return lastWeek
}

/**
 * 두 날짜 사이의 일수 차이를 계산
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {number} 일수 차이
 */
export const getDaysDifference = (startDate, endDate) => {
  const timeDifference = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDifference / (1000 * 3600 * 24))
}

/**
 * 날짜가 유효한지 확인
 * @param {string} dateString - 확인할 날짜 문자열
 * @returns {boolean} 유효 여부
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

export default {
  formatLocalDate,
  getYesterday,
  getSevenDaysAgo,
  getLastWeekSameDay,
  getDaysDifference,
  isValidDate
}