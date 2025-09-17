// 기간별 합산 데이터 컴포넌트

import React from 'react'
import styles from '../../styles/components/KeywordData.module.css'
import tableStyles from '../../styles/components/DataTable.module.css'
import { formatNumber, formatChangeRate } from '../../utils/formatUtils.js'

const PeriodSummary = ({
  periodSummary,
  searchConditions
}) => {
  
  const getChangeRateStyle = (rate) => {
    const { text, className } = formatChangeRate(rate)
    const cssClass = className === 'positive' ? tableStyles.changeRatePositive :
                    className === 'negative' ? tableStyles.changeRateNegative :
                    tableStyles.changeRateNeutral
    
    return { text, className: cssClass }
  }

  return (
    <div className={styles.periodSummarySection}>
      <div className={styles.periodSummaryHeader}>
        <h3 className={styles.periodSummaryTitle}>기간별 합산 데이터</h3>
        
        {/* 검색 조건 표시 */}
        {searchConditions && (
          <div className={styles.searchConditions}>
            <strong>검색 조건:</strong> 
            <span className={styles.searchConditionsLabel}>
              {searchConditions.selectedDate} | {searchConditions.selectedMedias?.join(', ')} | {searchConditions.keywordMetric} ({searchConditions.sortOrder})
              {searchConditions.keywordCount && ` | ${searchConditions.keywordCount}개`}
            </span>
          </div>
        )}
      </div>
      
      <div className={styles.tableContainer}>
        <table className={tableStyles.periodTable}>
          <thead className={tableStyles.periodTableHeader}>
            <tr>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>기간</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>광고비</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>CPC</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>전환수</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>CPA</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>CVR</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>노출수</th>
              <th className={`${tableStyles.periodTableHeaderCell} ${tableStyles.periodTableHeaderCellCenter}`}>클릭수</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>전일</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalCostYesterday)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.avgCpcYesterday)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalConversionsYesterday)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.avgCpaYesterday)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>11.16%</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>138,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>6,600</td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>당일</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalCostToday)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.avgCpc)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalConversions)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.avgCpa)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{(periodSummary.conversionRate || 0).toFixed(2)}%</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalImpressions)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalClicks)}</td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>등락</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${getChangeRateStyle(periodSummary.costChangeRate).className}`}>
                {getChangeRateStyle(periodSummary.costChangeRate).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${getChangeRateStyle(periodSummary.cpcChangeRate).className}`}>
                {getChangeRateStyle(periodSummary.cpcChangeRate).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(8.5).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-3.2).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(2.1).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(15.3).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(12.7).text}
              </td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>이전 7일</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalCostLastWeek)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>373</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>5,625</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>2,844</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>9.84%</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>915,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>43,500</td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>최근 7일</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>{formatNumber(periodSummary.totalCost7Days)}</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>343</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>6,450</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>2,480</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>10.44%</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>1,020,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>46,500</td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>등락</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${getChangeRateStyle(periodSummary.costChangeRate).className}`}>
                {getChangeRateStyle(periodSummary.costChangeRate).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${getChangeRateStyle(periodSummary.cpcChangeRate).className}`}>
                {getChangeRateStyle(periodSummary.cpcChangeRate).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(14.7).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-12.8).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(6.1).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(11.5).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRatePositive}`}>
                {formatChangeRate(6.9).text}
              </td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>전월</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>49,920,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>350</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>28,500</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>1,752</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>11.28%</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>4,020,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>185,250</td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>당월</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>45,600,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>323</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>25,500</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>1,788</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>10.68%</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>3,645,000</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>165,750</td>
            </tr>
            <tr>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter}`}>등락</td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-8.6).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-7.7).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-10.5).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${getChangeRateStyle(periodSummary.cpaChangeRate).className}`}>
                {getChangeRateStyle(periodSummary.cpaChangeRate).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-5.3).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-9.3).text}
              </td>
              <td className={`${tableStyles.periodTableCell} ${tableStyles.periodTableHeaderCellCenter} ${tableStyles.changeRateNegative}`}>
                {formatChangeRate(-10.5).text}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PeriodSummary