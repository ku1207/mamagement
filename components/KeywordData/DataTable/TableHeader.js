// 테이블 헤더 컴포넌트

import React from 'react'
import tableStyles from '../../../styles/components/DataTable.module.css'

const TableHeader = ({
  showCostData,
  showCpcData,
  showConversionData,
  showCpaData,
  showOtherData
}) => {
  return (
    <thead>
      {/* 상단 헤더 - 그룹 제목 */}
      <tr className={tableStyles.tableHeader}>
        <th rowSpan={2} className={`${tableStyles.headerCell} ${tableStyles.mediaColumn}`}>매체</th>
        <th rowSpan={2} className={`${tableStyles.headerCell} ${tableStyles.keywordColumn}`}>키워드</th>
        
        {/* 광고비 데이터 그룹 */}
        {showCostData && (
          <th colSpan={6} className={`${tableStyles.headerCell} ${tableStyles.costDataGroup}`}>
            광고비
          </th>
        )}
        
        {/* CPC 데이터 그룹 */}
        {showCpcData && (
          <th colSpan={6} className={`${tableStyles.headerCell} ${tableStyles.cpcDataGroup}`}>
            CPC
          </th>
        )}
        
        {/* 전환수 데이터 그룹 */}
        {showConversionData && (
          <th colSpan={6} className={`${tableStyles.headerCell} ${tableStyles.conversionDataGroup}`}>
            전환수
          </th>
        )}
        
        {/* CPA 데이터 그룹 */}
        {showCpaData && (
          <th colSpan={6} className={`${tableStyles.headerCell} ${tableStyles.cpaDataGroup}`}>
            CPA
          </th>
        )}
        
        {/* 기타 데이터 그룹 */}
        {showOtherData && (
          <th colSpan={5} className={`${tableStyles.headerCell} ${tableStyles.otherDataGroup}`}>
            기타
          </th>
        )}
      </tr>
      
      {/* 하단 헤더 - 세부 컬럼 */}
      <tr className={tableStyles.tableHeaderSecondary}>
        {/* 광고비 데이터 */}
        {showCostData && (
          <>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>당일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>전일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>최근 7일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>지난주</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>당월</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>전월</th>
          </>
        )}
        
        {/* CPC 데이터 */}
        {showCpcData && (
          <>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>당일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>전일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>최근 7일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>지난주</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>당월</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>전월</th>
          </>
        )}
        
        {/* 전환수 데이터 */}
        {showConversionData && (
          <>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>당일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>전일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>최근 7일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>지난주</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>당월</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>전월</th>
          </>
        )}
        
        {/* CPA 데이터 */}
        {showCpaData && (
          <>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>당일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>전일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>최근 7일</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>지난주</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>당월</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>전월</th>
          </>
        )}
        
        {/* 기타 데이터 */}
        {showOtherData && (
          <>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.campaignColumn}`}>캠페인</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.adGroupColumn}`}>광고그룹</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.dataColumn}`}>노출수</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.dataColumn}`}>클릭수</th>
            <th className={`${tableStyles.headerCellSecondary} ${tableStyles.ctrColumn}`}>CTR</th>
          </>
        )}
      </tr>
    </thead>
  )
}

export default TableHeader