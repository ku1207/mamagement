// 테이블 행 컴포넌트

import React, { useState } from 'react'
import tableStyles from '../../../styles/components/DataTable.module.css'
import keywordStyles from '../../../styles/components/KeywordManagement.module.css'
import { calculateConversions, calculateCPA } from '../../../utils/dataCalculations.js'

const TableRow = ({
  item,
  index,
  showCostData,
  showCpcData,
  showConversionData,
  showCpaData,
  showOtherData,
  onArrowClick,
  isExpanded
}) => {
  const isEven = index % 2 === 0
  const rowClass = isEven ? tableStyles.tableRowEven : tableStyles.tableRowOdd
  const [showModal, setShowModal] = useState(false)
  const [newEntry, setNewEntry] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [managementHistory, setManagementHistory] = useState(item.managementHistory || [])

  const handleInfoClick = (e) => {
    e.stopPropagation()
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsAdding(false)
    setNewEntry('')
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  const handleAddEntry = () => {
    setIsAdding(true)
    setNewEntry('')
  }

  const handleSaveEntry = () => {
    if (newEntry.trim()) {
      const newHistoryEntry = {
        no: managementHistory.length + 1,
        content: newEntry.trim(),
        modifiedTime: new Date().toISOString()
      }
      
      setManagementHistory(prev => [newHistoryEntry, ...prev])
      setIsAdding(false)
      setNewEntry('')
      
      // 실제 구현에서는 여기서 API 호출하여 서버에 저장
      console.log('새 관리 내역 추가:', newHistoryEntry)
    }
  }

  const handleCancelEntry = () => {
    setIsAdding(false)
    setNewEntry('')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    // 한국시각(UTC+9)으로 변환
    const koreanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    return koreanTime.toISOString().slice(0, 16).replace('T', ' ')
  }

  // 관리 내역 데이터 정렬 및 번호 재정렬
  const sortedHistory = [...managementHistory]
    .sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime))
    .map((historyItem, historyIndex) => ({
      ...historyItem,
      no: historyIndex + 1
    }))
  
  // 새로 추가되는 항목의 NO는 항상 1 (최신이므로)
  const nextNo = 1

  return (
    <>
      <tr 
        className={`${tableStyles.tableRow} ${rowClass} ${isExpanded ? tableStyles.expandedMainRow : ''}`}
      >
      <td className={`${tableStyles.tableCell} ${tableStyles.mediaColumn}`}>
        {item.media}
      </td>
      <td className={`${tableStyles.tableCell} ${tableStyles.keywordColumn}`}>
        <div className={tableStyles.keywordWithExpander} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span 
              className={`${tableStyles.expandIcon} ${isExpanded ? tableStyles.expanded : ''}`}
              onClick={onArrowClick}
              style={{ cursor: 'pointer', marginRight: '8px' }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
            <span>
              {item.keyword}
            </span>
          </div>
          <div>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              onClick={handleInfoClick}
              style={{ 
                color: '#6c757d', 
                cursor: 'pointer',
                flexShrink: 0,
                marginLeft: '8px'
              }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
        </div>
      </td>
      
      {/* 광고비 데이터 */}
      {showCostData && (
        <>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {item.cost_today.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {item.cost_yesterday.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {item.cost_7days.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {item.cost_last_week.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {item.cost_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.costDataCell} ${tableStyles.dataColumn}`}>
            {item.cost_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* CPC 데이터 */}
      {showCpcData && (
        <>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {item.cpc_today.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {item.cpc_yesterday.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {item.cpc_7days.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {item.cpc_last_week.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {item.cpc_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpcDataCell} ${tableStyles.dataColumn}`}>
            {item.cpc_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* 전환수 데이터 */}
      {showConversionData && (
        <>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(item.clicks, 0.12).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(item.clicks, 0.10).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(item.clicks, 0.11).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {calculateConversions(item.clicks, 0.09).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {item.conversions_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.conversionDataCell} ${tableStyles.dataColumn}`}>
            {item.conversions_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* CPA 데이터 */}
      {showCpaData && (
        <>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(item.cost_today, calculateConversions(item.clicks, 0.12)).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(item.cost_yesterday, calculateConversions(item.clicks, 0.10)).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(item.cost_7days, calculateConversions(item.clicks, 0.11)).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {calculateCPA(item.cost_last_week, calculateConversions(item.clicks, 0.09)).toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {item.cpa_current_month.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.cpaDataCell} ${tableStyles.dataColumn}`}>
            {item.cpa_last_month.toLocaleString()}
          </td>
        </>
      )}
      
      {/* 기타 데이터 */}
      {showOtherData && (
        <>
          <td className={`${tableStyles.tableCell} ${tableStyles.campaignColumn}`}>
            {item.campaign}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.adGroupColumn}`}>
            {item.adGroup}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.dataColumn}`}>
            {item.impressions.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.dataColumn}`}>
            {item.clicks.toLocaleString()}
          </td>
          <td className={`${tableStyles.tableCell} ${tableStyles.tableCellRight} ${tableStyles.ctrColumn}`}>
            {item.ctr.toFixed(1)}%
          </td>
        </>
      )}
      </tr>
      
      {/* 키워드 정보 모달 */}
      {showModal && (
        <div className={keywordStyles.modalBackdrop} onClick={handleBackdropClick}>
          <div className={keywordStyles.modalContainer}>
            <div className={keywordStyles.modalHeader}>
              <h3>
                관리 내역 - <span className={keywordStyles.keywordDetails}>{item.media}·{item.campaign}·{item.adGroup}·{item.keyword}</span>
              </h3>
              <button 
                type="button" 
                className="btn-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <div className={keywordStyles.modalContent}>
              <div className={keywordStyles.addButtonContainer}>
                <button 
                  type="button" 
                  className="btn btn-success btn-sm"
                  onClick={handleAddEntry}
                  disabled={isAdding}
                >
                  추가
                </button>
              </div>
              
              {sortedHistory.length === 0 && !isAdding ? (
                <div className={keywordStyles.emptyHistory}>
                  <p>관리 내역이 없습니다.</p>
                </div>
              ) : (
                <div className={keywordStyles.historyTableContainer}>
                  <table className={keywordStyles.historyTable}>
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>내용</th>
                        <th>수정 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isAdding && (
                        <tr className={keywordStyles.newEntryRow}>
                          <td>{nextNo}</td>
                          <td>
                            <div className={keywordStyles.inputContainer}>
                              <input
                                type="text"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                placeholder="관리 내역을 입력하세요"
                                className={keywordStyles.entryInput}
                                autoFocus
                              />
                              <div className={keywordStyles.inputActions}>
                                <button 
                                  type="button" 
                                  className="btn btn-info btn-xs"
                                  onClick={handleSaveEntry}
                                  disabled={!newEntry.trim()}
                                >
                                  저장
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-xs"
                                  onClick={handleCancelEntry}
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>{formatDateTime(new Date())}</td>
                        </tr>
                      )}
                      {sortedHistory.map((history) => (
                        <tr key={`${history.no}-${history.modifiedTime}`}>
                          <td>{history.no}</td>
                          <td>{history.content}</td>
                          <td>{formatDateTime(history.modifiedTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className={keywordStyles.modalFooter}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleCloseModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TableRow