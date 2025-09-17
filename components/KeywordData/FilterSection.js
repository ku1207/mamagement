// 필터 섹션 컴포넌트

import React from 'react'
import styles from '../../styles/components/KeywordData.module.css'

const FilterSection = ({
  // 필터 상태
  selectedMedias,
  keywordMetric,
  sortOrder,
  keywordCount,
  selectedDate,
  costRangeMin,
  costRangeMax,
  
  // 설정 함수
  onMediaChange,
  onKeywordMetricChange,
  onSortOrderChange,
  onKeywordCountChange,
  onSelectedDateChange,
  onCostRangeMinChange,
  onCostRangeMaxChange,
  onSearch,
  
  // 기타 props
  availableMedias = ['네이버', '카카오', '구글', '메타', '틱톡']
}) => {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterContainer}>
        {/* 매체 선택 */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>매체 선택</label>
          <div className={styles.mediaCheckboxContainer}>
            {availableMedias.map(media => (
              <label key={media} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedMedias.includes(media)}
                  onChange={() => onMediaChange(media)}
                  className={styles.checkboxInput}
                />
                {media}
              </label>
            ))}
          </div>
        </div>

        {/* 조회 날짜 */}
        <div className={styles.filterGroupFixed}>
          <label className={styles.filterLabel}>조회 날짜</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectedDateChange(e.target.value)}
            className={styles.dateInput}
          />
        </div>
        
        {/* 키워드 필터링 */}
        <div className={styles.filterGroupLarge}>
          <label className={styles.filterLabel}>키워드 필터링</label>
          <div className={styles.keywordFiltering}>
            <div className={styles.filterControls}>
              {/* 지표 선택 */}
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>지표</label>
                <select 
                  value={keywordMetric} 
                  onChange={(e) => onKeywordMetricChange(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="클릭수">클릭수</option>
                  <option value="CPC">CPC</option>
                  <option value="광고비">광고비</option>
                </select>
              </div>
              
              {/* 정렬 선택 */}
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>정렬</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => onSortOrderChange(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="내림차순">내림차순</option>
                  <option value="오름차순">오름차순</option>
                </select>
              </div>
              
              {/* 개수 입력 */}
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>개수</label>
                <input
                  type="number"
                  value={keywordCount}
                  onChange={(e) => onKeywordCountChange(e.target.value)}
                  placeholder="전체"
                  min="1"
                  className={styles.numberInput}
                />
              </div>
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={onSearch}
              className={styles.searchButton}
            >
              검색
            </button>
          </div>

          {/* CPC 선택 시 광고비 범위 입력 */}
          {keywordMetric === 'CPC' && (
            <div className={styles.costRangeFilter}>
              <label className={styles.costRangeLabel}>광고비 범위</label>
              <input
                type="number"
                value={costRangeMin}
                onChange={(e) => onCostRangeMinChange(e.target.value)}
                placeholder="최소"
                min="0"
                className={styles.numberInput}
              />
              <span className={styles.costRangeText}>이상</span>
              <input
                type="number"
                value={costRangeMax}
                onChange={(e) => onCostRangeMaxChange(e.target.value)}
                placeholder="최대"
                min="0"
                className={styles.numberInput}
              />
              <span className={styles.costRangeText}>이하</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterSection