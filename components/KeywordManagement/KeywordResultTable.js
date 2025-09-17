import React, { useState } from 'react'
import ManagementHistoryModal from './ManagementHistoryModal.js'
import styles from '../../styles/components/KeywordManagement.module.css'

const KeywordResultTable = ({ keywords = [] }) => {
  const [selectedKeyword, setSelectedKeyword] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const handleViewHistory = (keyword) => {
    setSelectedKeyword(keyword)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedKeyword(null)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    // 한국시각(UTC+9)으로 변환
    const koreanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    return koreanTime.toISOString().slice(0, 16).replace('T', ' ')
  }

  // 페이지네이션 계산
  const totalItems = keywords.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = keywords.slice(startIndex, endIndex)

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // 페이지 당 아이템 수 변경 처리
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // 첫 페이지로 리셋
  }

  // 페이지 번호 생성
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  if (keywords.length === 0) {
    return (
      <div className={styles.emptyResults}>
        <p>검색 결과가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.keywordTable}>
          <thead>
            <tr>
              <th>매체</th>
              <th>캠페인</th>
              <th>그룹</th>
              <th>키워드(소재)</th>
              <th>내용</th>
              <th>최근 수정 시간</th>
              <th>관리 내역</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((keyword) => {
              // 가장 최신 관리 내역 찾기
              const latestHistory = keyword.managementHistory && keyword.managementHistory.length > 0
                ? keyword.managementHistory.reduce((latest, history) => 
                    new Date(history.modifiedTime) > new Date(latest.modifiedTime) ? history : latest
                  )
                : null;
              
              return (
                <tr key={keyword.id}>
                  <td>{keyword.media}</td>
                  <td>{keyword.campaign}</td>
                  <td>{keyword.group}</td>
                  <td>{keyword.keyword}</td>
                  <td>{latestHistory ? latestHistory.content : '-'}</td>
                  <td>{formatDateTime(keyword.lastModified)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewHistory(keyword)}
                    >
                      확인
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 컨트롤 */}
      {totalItems > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            <div className={styles.itemsPerPageControl}>
              <label htmlFor="itemsPerPage">페이지 당 항목 수:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={styles.itemsPerPageSelect}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className={styles.totalInfo}>
              총 {totalItems}개 중 {startIndex + 1}-{Math.min(endIndex, totalItems)}개 표시
            </div>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationControls}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="btn btn-light btn-sm"
              >
                ≪
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-light btn-sm"
              >
                ‹
              </button>
              
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`btn btn-sm ${
                    pageNumber === currentPage ? 'btn-primary' : 'btn-light'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-light btn-sm"
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-light btn-sm"
              >
                ≫
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && selectedKeyword && (
        <ManagementHistoryModal
          keyword={selectedKeyword}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

export default KeywordResultTable