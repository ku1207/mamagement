// KPI 관리 컴포넌트

import React, { useState } from 'react'
import styles from '../../styles/components/KeywordManagement.module.css'

const KpiManagement = ({ isModal = false, onClose = null }) => {
  const [selectedMedia, setSelectedMedia] = useState('네이버')
  const [kpiData, setKpiData] = useState({
    '네이버': { metrics: {} },
    '카카오': { metrics: {} },
    '구글': { metrics: {} },
    '메타': { metrics: {} },
    '틱톡': { metrics: {} }
  })

  const mediaOptions = ['네이버', '카카오', '구글', '메타', '틱톡']

  // 키워드별 데이터 페이지에서 사용 가능한 지표들
  const availableMetrics = [
    { id: 'cost', label: '광고비', unit: '원', description: '총 광고 비용' },
    { id: 'cpc', label: 'CPC', unit: '원', description: '클릭당 비용' },
    { id: 'conversion', label: '전환수', unit: '개', description: '전환 횟수' },
    { id: 'cpa', label: 'CPA', unit: '원', description: '전환당 비용' },
    { id: 'ctr', label: 'CTR', unit: '%', description: '클릭률' },
    { id: 'cvr', label: 'CVR', unit: '%', description: '전환율' },
    { id: 'impressions', label: '노출수', unit: '회', description: '광고 노출 횟수' },
    { id: 'clicks', label: '클릭수', unit: '회', description: '광고 클릭 횟수' }
  ]

  const handleKpiChange = (field, value) => {
    setKpiData(prev => ({
      ...prev,
      [selectedMedia]: {
        ...prev[selectedMedia],
        metrics: {
          ...prev[selectedMedia].metrics,
          [field]: value
        }
      }
    }))
  }

  const handleSaveKpi = () => {
    console.log('KPI 저장:', { selectedMedia, kpiData: kpiData[selectedMedia] })
    // 실제 구현에서는 여기서 API 호출
    alert(`${selectedMedia} KPI가 저장되었습니다.`)
  }

  const currentKpi = kpiData[selectedMedia]

  const content = (
    <div className={isModal ? "kpi-management-modal-content" : "kpi-management-content"}>
      {/* 매체별 KPI 목표 설정 섹션 */}
      <div className="kpi-section">
        <div className="kpi-header">
          <h3>매체별 KPI 목표 설정</h3>
          <div className="media-selector">
            <label htmlFor="kpi-media-select">매체 선택:</label>
            <select 
              id="kpi-media-select"
              value={selectedMedia}
              onChange={(e) => setSelectedMedia(e.target.value)}
              className="kpi-media-select"
            >
              {mediaOptions.map(media => (
                <option key={media} value={media}>{media}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="kpi-form">
          <div className="kpi-grid">
            {availableMetrics.map(metric => (
              <div key={metric.id} className="kpi-item">
                <label className="kpi-label">
                  월 목표 {metric.label} {metric.unit && `(${metric.unit})`}
                </label>
                <input 
                  type="number" 
                  step={metric.id === 'ctr' || metric.id === 'cvr' ? '0.01' : '1'}
                  placeholder={`${metric.label} 목표를 입력하십시오.`}
                  value={currentKpi.metrics[metric.id] || ''}
                  onChange={(e) => handleKpiChange(metric.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="kpi-actions">
            <button 
              className="btn btn-primary btn-md"
              onClick={handleSaveKpi}
              style={{ marginRight: '10px' }}
            >
              {selectedMedia} KPI 저장
            </button>
            {isModal && onClose && (
              <button 
                className="btn btn-secondary btn-md"
                onClick={onClose}
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose && onClose()}>
        <div className={styles.modalContainer} style={{ maxWidth: '800px', width: '90%' }}>
          <div className={styles.modalHeader}>
            <h3 style={{ margin: 0 }}>KPI 목표 설정</h3>
            <button 
              type="button" 
              className={styles.modalCloseButton}
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className={styles.modalContent}>
            {content}
          </div>
        </div>
      </div>
    )
  }

  return content
}

export default KpiManagement