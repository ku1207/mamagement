// 확장된 행 컴포넌트 (매체별 상세 데이터)

import React from 'react'
import tableStyles from '../../../styles/components/DataTable.module.css'
import { calculateConversions, calculateCPA } from '../../../utils/dataCalculations.js'

const ExpandedRow = ({
  mediaItem,
  showCostData,
  showCpcData,
  showConversionData,
  showCpaData,
  showOtherData
}) => {
  return (
    <tr className={tableStyles.expandedRow}>
      <td className={`${tableStyles.expandedCell} ${tableStyles.mediaColumn}`}>
        <span className={tableStyles.expandedIndent}>└</span> {mediaItem.media}
      </td>
      <td className={`${tableStyles.expandedCell} ${tableStyles.keywordColumn}`}>
        {mediaItem.keyword}
      </td>
      
      {/* 광고비 데이터 */}
      {showCostData && (
        <>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cost_today.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cost_yesterday.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cost_7days.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cost_last_week.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cost_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cost_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* CPC 데이터 */}
      {showCpcData && (
        <>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpc_today.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpc_yesterday.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpc_7days.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpc_last_week.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpc_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpc_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* 전환수 데이터 */}
      {showConversionData && (
        <>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(mediaItem.clicks, 0.12).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(mediaItem.clicks, 0.10).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(mediaItem.clicks, 0.11).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(mediaItem.clicks, 0.09).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.conversions_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.conversions_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* CPA 데이터 */}
      {showCpaData && (
        <>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(mediaItem.cost_today, calculateConversions(mediaItem.clicks, 0.12)).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(mediaItem.cost_yesterday, calculateConversions(mediaItem.clicks, 0.10)).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(mediaItem.cost_7days, calculateConversions(mediaItem.clicks, 0.11)).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(mediaItem.cost_last_week, calculateConversions(mediaItem.clicks, 0.09)).toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpa_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {mediaItem.cpa_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* 기타 데이터 */}
      {showOtherData && (
        <>
          <td className={`${tableStyles.expandedCell} ${tableStyles.campaignColumn}`}>
            {mediaItem.campaign}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.adGroupColumn}`}>
            {mediaItem.adGroup}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.dataColumn}`}>
            {mediaItem.impressions.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.dataColumn}`}>
            {mediaItem.clicks.toLocaleString()}
          </td>
          <td className={`${tableStyles.expandedCell} ${tableStyles.expandedCellRight} ${tableStyles.ctrColumn}`}>
            {mediaItem.ctr.toFixed(1)}%
          </td>
        </>
      )}
    </tr>
  )
}

export default ExpandedRow