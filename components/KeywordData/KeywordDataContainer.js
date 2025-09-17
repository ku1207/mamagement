// 키워드 데이터 메인 컨테이너 컴포넌트

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.js'
import useKeywordData from '../../hooks/useKeywordData.js'
import useFilters from '../../hooks/useFilters.js'
import styles from '../../styles/components/KeywordData.module.css'
import FilterSection from './FilterSection.js'
import PeriodSummary from './PeriodSummary.js'
import DataSelector from './DataSelector.js'
import DataTable from './DataTable/index.js'
import KpiViewModal from '../KpiManagement/KpiViewModal.js'

const KeywordDataContainer = () => {
  const { selectedAdvertiser } = useAuth()
  
  // 키워드 데이터 훅
  const {
    filteredKeywords,
    periodSummary,
    loading,
    error,
    applyKeywordFilters
  } = useKeywordData()
  
  // 필터 상태 훅
  const {
    selectedMedias,
    keywordMetric,
    sortOrder,
    keywordCount,
    selectedDate,
    costRangeMin,
    costRangeMax,
    setSelectedMedias,
    setKeywordMetric,
    setSortOrder,
    setKeywordCount,
    setSelectedDate,
    setCostRangeMin,
    setCostRangeMax,
    handleMediaChange,
    getFilterParams
  } = useFilters()

  // 표시할 데이터 선택 상태 관리
  const [showCostData, setShowCostData] = useState(true)
  const [showCpcData, setShowCpcData] = useState(true)
  const [showConversionData, setShowConversionData] = useState(false)
  const [showCpaData, setShowCpaData] = useState(false)
  const [showOtherData, setShowOtherData] = useState(true)

  // KPI 모달 상태 관리
  const [showKpiModal, setShowKpiModal] = useState(false)
  
  // 디버깅을 위한 상태 로그
  console.log('showKpiModal 상태:', showKpiModal)


  // 광고주가 선택되지 않은 경우
  if (!selectedAdvertiser) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">
              광고주를 선택해주세요
            </h3>
            <p className="empty-state-description">
              상단 네비게이션에서 광고주를 선택하면 키워드별 데이터를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 검색 실행
  const handleSearch = () => {
    const filterParams = getFilterParams()
    applyKeywordFilters(filterParams)
  }

  // 검색 조건 객체
  const searchConditions = {
    selectedDate,
    selectedMedias,
    keywordMetric,
    sortOrder,
    keywordCount
  }

  if (loading) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-content">
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-content">
            <p style={{ color: '#dc3545' }}>오류가 발생했습니다: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-area">
      {/* 필터 영역 */}
      <FilterSection
        selectedMedias={selectedMedias}
        keywordMetric={keywordMetric}
        sortOrder={sortOrder}
        keywordCount={keywordCount}
        selectedDate={selectedDate}
        costRangeMin={costRangeMin}
        costRangeMax={costRangeMax}
        onMediaChange={handleMediaChange}
        onKeywordMetricChange={setKeywordMetric}
        onSortOrderChange={setSortOrder}
        onKeywordCountChange={setKeywordCount}
        onSelectedDateChange={setSelectedDate}
        onCostRangeMinChange={setCostRangeMin}
        onCostRangeMaxChange={setCostRangeMax}
        onSearch={handleSearch}
      />

      <div style={{ marginTop: '20px' }}>
        {/* 기간별 합산 정보 */}
        <PeriodSummary
          periodSummary={periodSummary}
          searchConditions={searchConditions}
        />

        {/* 키워드(소재) 상세 데이터 */}
        <div className={styles.keywordDetailSection}>
          <div className={styles.keywordDetailHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h3 className={styles.keywordDetailTitle}>금일 키워드 상세 데이터</h3>
              <button
                type="button"
                className="btn btn-info btn-sm"
                onClick={() => {
                  console.log('KPI 확인 버튼 클릭됨')
                  setShowKpiModal(true)
                }}
              >
                KPI 확인
              </button>
            </div>
            <span className={styles.keywordDetailHint}>
              각 매체별 키워드 데이터를 표시합니다.
            </span>
          </div>
          
          {/* 표시할 데이터 선택 */}
          <DataSelector
            showCostData={showCostData}
            showCpcData={showCpcData}
            showConversionData={showConversionData}
            showCpaData={showCpaData}
            showOtherData={showOtherData}
            onShowCostDataChange={setShowCostData}
            onShowCpcDataChange={setShowCpcData}
            onShowConversionDataChange={setShowConversionData}
            onShowCpaDataChange={setShowCpaData}
            onShowOtherDataChange={setShowOtherData}
          />
          
          {/* 데이터 테이블 */}
          <DataTable
            filteredKeywords={filteredKeywords}
            showCostData={showCostData}
            showCpcData={showCpcData}
            showConversionData={showConversionData}
            showCpaData={showCpaData}
            showOtherData={showOtherData}
          />
        </div>
      </div>

      {/* KPI 확인 모달 */}
      {showKpiModal && (
        <KpiViewModal
          onClose={() => {
            console.log('KPI 모달 닫기')
            setShowKpiModal(false)
          }}
        />
      )}
    </div>
  )
}

export default KeywordDataContainer