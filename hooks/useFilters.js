// 필터 상태 관리 커스텀 훅

import { useState, useCallback } from 'react'
import { formatLocalDate, getYesterday } from '../utils/dateUtils.js'

/**
 * 필터 상태 관리 훅
 * @returns {Object} 필터 상태 및 관리 함수들
 */
export const useFilters = () => {
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(getYesterday()))
  const [costRangeMin, setCostRangeMin] = useState('')
  const [costRangeMax, setCostRangeMax] = useState('')

  /**
   * 매체 선택 처리 함수
   */
  const handleMediaChange = useCallback((media) => {
    setSelectedMedias(prev => {
      if (prev.includes(media)) {
        // 최소 1개는 선택되어야 함
        if (prev.length > 1) {
          return prev.filter(m => m !== media)
        }
        return prev
      } else {
        return [...prev, media]
      }
    })
  }, [])

  /**
   * 모든 매체 선택/해제
   */
  const toggleAllMedias = useCallback((medias = ['네이버', '카카오', '구글', '메타', '틱톡']) => {
    const allSelected = medias.every(media => selectedMedias.includes(media))
    if (allSelected) {
      // 모두 선택되어 있으면 첫 번째만 남기고 해제
      setSelectedMedias([medias[0]])
    } else {
      // 일부만 선택되어 있으면 모두 선택
      setSelectedMedias(medias)
    }
  }, [selectedMedias])

  /**
   * 필터 초기화
   */
  const resetFilters = useCallback(() => {
    setSelectedMedias(['네이버', '카카오', '구글', '메타', '틱톡'])
    setKeywordMetric('광고비')
    setSortOrder('내림차순')
    setKeywordCount('')
    setSelectedDate(formatLocalDate(getYesterday()))
    setCostRangeMin('')
    setCostRangeMax('')
  }, [])

  /**
   * 현재 필터 상태를 객체로 반환
   */
  const getFilterParams = useCallback(() => {
    return {
      selectedMedias,
      metric: keywordMetric,
      order: sortOrder,
      count: keywordCount,
      minCost: costRangeMin,
      maxCost: costRangeMax,
      selectedDate
    }
  }, [selectedMedias, keywordMetric, sortOrder, keywordCount, costRangeMin, costRangeMax, selectedDate])

  /**
   * 필터 상태 검증
   */
  const validateFilters = useCallback(() => {
    const errors = []

    if (!selectedMedias || selectedMedias.length === 0) {
      errors.push('최소 하나의 매체를 선택해주세요.')
    }

    if (keywordCount && (isNaN(keywordCount) || parseInt(keywordCount) < 1)) {
      errors.push('키워드 개수는 1 이상의 숫자여야 합니다.')
    }

    if (costRangeMin && isNaN(costRangeMin)) {
      errors.push('최소 광고비는 숫자여야 합니다.')
    }

    if (costRangeMax && isNaN(costRangeMax)) {
      errors.push('최대 광고비는 숫자여야 합니다.')
    }

    if (costRangeMin && costRangeMax && parseInt(costRangeMin) > parseInt(costRangeMax)) {
      errors.push('최소 광고비는 최대 광고비보다 작아야 합니다.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [selectedMedias, keywordCount, costRangeMin, costRangeMax])

  /**
   * 필터가 기본값과 다른지 확인
   */
  const hasChanges = useCallback(() => {
    const defaultState = {
      selectedMedias: ['네이버', '카카오', '구글', '메타', '틱톡'],
      keywordMetric: '광고비',
      sortOrder: '내림차순',
      keywordCount: '',
      selectedDate: formatLocalDate(getYesterday()),
      costRangeMin: '',
      costRangeMax: ''
    }

    return (
      JSON.stringify(selectedMedias.sort()) !== JSON.stringify(defaultState.selectedMedias.sort()) ||
      keywordMetric !== defaultState.keywordMetric ||
      sortOrder !== defaultState.sortOrder ||
      keywordCount !== defaultState.keywordCount ||
      selectedDate !== defaultState.selectedDate ||
      costRangeMin !== defaultState.costRangeMin ||
      costRangeMax !== defaultState.costRangeMax
    )
  }, [selectedMedias, keywordMetric, sortOrder, keywordCount, selectedDate, costRangeMin, costRangeMax])

  return {
    // 상태
    selectedMedias,
    keywordMetric,
    sortOrder,
    keywordCount,
    selectedDate,
    costRangeMin,
    costRangeMax,

    // 설정 함수
    setSelectedMedias,
    setKeywordMetric,
    setSortOrder,
    setKeywordCount,
    setSelectedDate,
    setCostRangeMin,
    setCostRangeMax,

    // 유틸리티 함수
    handleMediaChange,
    toggleAllMedias,
    resetFilters,
    getFilterParams,
    validateFilters,
    hasChanges,

    // 상태 정보
    isDefaultState: !hasChanges(),
    selectedMediaCount: selectedMedias.length
  }
}

export default useFilters