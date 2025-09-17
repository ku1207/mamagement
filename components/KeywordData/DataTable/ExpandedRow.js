// 확장된 행 컴포넌트 (매체별 상세 데이터)

import React, { useState } from 'react'
import tableStyles from '../../../styles/components/DataTable.module.css'
import keywordStyles from '../../../styles/components/KeywordManagement.module.css'
import { calculateConversions, calculateCPA } from '../../../utils/dataCalculations.js'

const ExpandedRow = ({
  mediaItem,
  showCostData,
  showCpcData,
  showConversionData,
  showCpaData,
  showOtherData
}) => {
  const [showModal, setShowModal] = useState(false)
  const [newEntry, setNewEntry] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [managementHistory, setManagementHistory] = useState(mediaItem.managementHistory || [])

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
    <tr className={tableStyles.expandedRow}>
      <td className={`${tableStyles.expandedCell} ${tableStyles.mediaColumn}`}>
        <span className={tableStyles.expandedIndent}>└</span> {mediaItem.media}
      </td>
      <td className={`${tableStyles.expandedCell} ${tableStyles.keywordColumn}`}>
        {mediaItem.keyword}
      </td>
      <td className={`${tableStyles.expandedCell} ${tableStyles.managementColumn}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              flexShrink: 0
            }}
            title="메모"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
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
    
    {/* 키워드 정보 모달 */}
    {showModal && (
      <div className={keywordStyles.modalBackdrop} onClick={handleBackdropClick}>
        <div className={keywordStyles.modalContainer}>
          <div className={keywordStyles.modalHeader}>
            <h3>
              관리 내역 - <span className={keywordStyles.keywordDetails}>{mediaItem.media}·{mediaItem.campaign}·{mediaItem.adGroup}·{mediaItem.keyword}</span>
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

export default ExpandedRow