import React, { useState } from 'react'
import styles from '../../styles/components/KeywordManagement.module.css'

const ManagementHistoryModal = ({ keyword, onClose }) => {
  const [newEntry, setNewEntry] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    // 한국시각(UTC+9)으로 변환
    const koreanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    return koreanTime.toISOString().slice(0, 16).replace('T', ' ')
  }

  const handleAddEntry = () => {
    setIsAdding(true)
    setNewEntry('')
  }

  const handleSaveEntry = () => {
    if (newEntry.trim()) {
      // 실제 구현에서는 여기서 API 호출하여 서버에 저장
      console.log('새 관리 내역 추가:', newEntry)
      setIsAdding(false)
      setNewEntry('')
      // 실제로는 부모 컴포넌트의 데이터를 업데이트해야 함
    }
  }

  const handleCancelEntry = () => {
    setIsAdding(false)
    setNewEntry('')
  }

  const sortedHistory = [...(keyword.managementHistory || [])]
    .sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime))
    .map((item, index, array) => ({
      ...item,
      no: array.length - index
    }))
  
  // 새로 추가되는 항목의 NO는 기존 최고 번호 + 1
  const nextNo = sortedHistory.length > 0 ? Math.max(...sortedHistory.map(item => item.no)) + 1 : 1

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3>
            관리 내역 - <span className={styles.keywordDetails}>{keyword.media}·{keyword.campaign}·{keyword.group}·{keyword.keyword}</span>
          </h3>
          <button 
            type="button" 
            className="btn-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.addButtonContainer}>
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
            <div className={styles.emptyHistory}>
              <p>관리 내역이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.historyTableContainer}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>내용</th>
                    <th>수정 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className={styles.newEntryRow}>
                      <td>{nextNo}</td>
                      <td>
                        <div className={styles.inputContainer}>
                          <input
                            type="text"
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                            placeholder="관리 내역을 입력하세요"
                            className={styles.entryInput}
                            autoFocus
                          />
                          <div className={styles.inputActions}>
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
                              className="btn btn-secondary btn-xs"
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
        
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManagementHistoryModal