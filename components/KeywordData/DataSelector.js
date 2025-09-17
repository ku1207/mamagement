// 데이터 선택 컴포넌트

import React from 'react'
import styles from '../../styles/components/KeywordData.module.css'

const DataSelector = ({
  showCostData,
  showCpcData,
  showConversionData,
  showCpaData,
  showOtherData,
  onShowCostDataChange,
  onShowCpcDataChange,
  onShowConversionDataChange,
  onShowCpaDataChange,
  onShowOtherDataChange
}) => {
  return (
    <div className={styles.dataSelector}>
      <div className={styles.dataSelectorContainer}>
        <div className={styles.dataSelectorSection}>
          <label className={styles.dataSelectorLabel}>
            표시할 데이터 선택:
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showCostData}
              onChange={(e) => onShowCostDataChange(e.target.checked)}
              className={styles.checkboxInput}
            />
            광고비
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showCpcData}
              onChange={(e) => onShowCpcDataChange(e.target.checked)}
              className={styles.checkboxInput}
            />
            CPC
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showConversionData}
              onChange={(e) => onShowConversionDataChange(e.target.checked)}
              className={styles.checkboxInput}
            />
            전환수
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showCpaData}
              onChange={(e) => onShowCpaDataChange(e.target.checked)}
              className={styles.checkboxInput}
            />
            CPA
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showOtherData}
              onChange={(e) => onShowOtherDataChange(e.target.checked)}
              className={styles.checkboxInput}
            />
            기타
          </label>
        </div>
      </div>
    </div>
  )
}

export default DataSelector