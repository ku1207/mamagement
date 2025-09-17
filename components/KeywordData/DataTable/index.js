// 메인 데이터 테이블 컴포넌트

import React, { useState } from 'react'
import styles from '../../../styles/components/KeywordData.module.css'
import tableStyles from '../../../styles/components/DataTable.module.css'
import TableHeader from './TableHeader.js'
import TableRow from './TableRow.js'
import ExpandedRow from './ExpandedRow.js'
import { generateMediaKeywordData } from '../../../utils/dataCalculations.js'

const DataTable = ({
  filteredKeywords,
  showCostData,
  showCpcData,
  showConversionData,
  showCpaData,
  showOtherData
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRowExpansion = (index) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index)
    } else {
      newExpandedRows.add(index)
    }
    setExpandedRows(newExpandedRows)
  }

  const getSameKeywordData = (keyword) => {
    return filteredKeywords.filter(item => item.keyword === keyword)
  }

  if (filteredKeywords.length === 0) {
    return (
      <div className={styles.emptyData}>
        검색 조건에 맞는 키워드가 없습니다.
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScrollContainer}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <TableHeader
              showCostData={showCostData}
              showCpcData={showCpcData}
              showConversionData={showConversionData}
              showCpaData={showCpaData}
              showOtherData={showOtherData}
            />
            <tbody>
              {filteredKeywords.map((item, index) => (
                <React.Fragment key={index}>
                  <TableRow
                    item={item}
                    index={index}
                    showCostData={showCostData}
                    showCpcData={showCpcData}
                    showConversionData={showConversionData}
                    showCpaData={showCpaData}
                    showOtherData={showOtherData}
                    onArrowClick={() => toggleRowExpansion(index)}
                    isExpanded={expandedRows.has(index)}
                  />
                  {expandedRows.has(index) && (
                    <>
                      {getSameKeywordData(item.keyword).map((sameKeywordItem, sameIndex) => (
                        sameKeywordItem !== item && (
                          <ExpandedRow
                            key={`${index}-${sameIndex}`}
                            mediaItem={sameKeywordItem}
                            showCostData={showCostData}
                            showCpcData={showCpcData}
                            showConversionData={showConversionData}
                            showCpaData={showCpaData}
                            showOtherData={showOtherData}
                          />
                        )
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DataTable