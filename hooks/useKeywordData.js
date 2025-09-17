// 키워드 데이터 관련 커스텀 훅

import { useState, useEffect, useCallback } from 'react'
import { generateKeywordData } from '../api/keyword/data.js'
import { applyFilters } from '../utils/filterUtils.js'
import { calculatePeriodSummary } from '../utils/dataCalculations.js'

/**
 * 키워드 데이터 관리 훅
 * @returns {Object} 키워드 데이터 상태 및 관리 함수들
 */
export const useKeywordData = () => {
  // 상태 관리
  const [keywordData, setKeywordData] = useState([])
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [periodSummary, setPeriodSummary] = useState({
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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 키워드 데이터 초기 로딩
   */
  const loadKeywordData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 현재는 더미 데이터 사용, 추후 API 호출로 변경 가능
      const data = generateKeywordData()
      setKeywordData(data)
      
      // 초기 필터링된 데이터 설정
      setFilteredKeywords(data)
      
      // 초기 기간별 요약 계산
      const summary = calculatePeriodSummary(data)
      setPeriodSummary(summary)
    } catch (err) {
      setError(err.message)
      console.error('키워드 데이터 로딩 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 필터 적용 함수
   */
  const applyKeywordFilters = useCallback((filterParams) => {
    try {
      setLoading(true)
      
      const filteredData = applyFilters({
        data: keywordData,
        ...filterParams
      })
      
      setFilteredKeywords(filteredData)
      
      // 필터링된 데이터로 기간별 요약 재계산
      const summary = calculatePeriodSummary(filteredData)
      setPeriodSummary(summary)
    } catch (err) {
      setError(err.message)
      console.error('필터 적용 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [keywordData])

  /**
   * 데이터 새로고침
   */
  const refreshData = useCallback(() => {
    loadKeywordData()
  }, [loadKeywordData])

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    loadKeywordData()
  }, [loadKeywordData])

  return {
    // 상태
    keywordData,
    filteredKeywords,
    periodSummary,
    loading,
    error,
    
    // 함수
    applyKeywordFilters,
    refreshData,
    clearError,
    
    // 통계 정보
    totalKeywords: keywordData.length,
    filteredCount: filteredKeywords.length
  }
}

export default useKeywordData