// KPI 확인 (달성률 표시) 모달 컴포넌트

import React, { useState } from 'react'
import styles from '../../styles/components/KeywordManagement.module.css'

const KpiViewModal = ({ onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState('네이버')

  // 더미 KPI 목표 데이터 (실제로는 API에서 가져와야 함)
  const kpiTargets = {
    '네이버': { cost: 1000000, cpc: 300, conversion: 100, cpa: 10000, ctr: 2.5, cvr: 10.0, impressions: 50000, clicks: 1000 },
    '카카오': { cost: 800000, cpc: 280, conversion: 80, cpa: 9500, ctr: 2.2, cvr: 9.5, impressions: 40000, clicks: 800 },
    '구글': { cost: 1200000, cpc: 350, conversion: 120, cpa: 11000, ctr: 2.8, cvr: 11.0, impressions: 60000, clicks: 1200 },
    '메타': { cost: 900000, cpc: 320, conversion: 90, cpa: 10500, ctr: 2.3, cvr: 9.8, impressions: 45000, clicks: 900 },
    '틱톡': { cost: 700000, cpc: 270, conversion: 70, cpa: 9000, ctr: 2.0, cvr: 8.5, impressions: 35000, clicks: 700 }
  }

  // 더미 현재 실적 데이터 (실제로는 API에서 가져와야 함)
  const currentPerformance = {
    '네이버': { cost: 850000, cpc: 310, conversion: 95, cpa: 8947, ctr: 2.7, cvr: 9.1, impressions: 52000, clicks: 1040 },
    '카카오': { cost: 720000, cpc: 290, conversion: 75, cpa: 9600, ctr: 2.4, cvr: 9.9, impressions: 38000, clicks: 760 },
    '구글': { cost: 1100000, cpc: 340, conversion: 110, cpa: 10000, ctr: 3.0, cvr: 9.5, impressions: 58000, clicks: 1160 },
    '메타': { cost: 950000, cpc: 315, conversion: 88, cpa: 10795, ctr: 2.5, cvr: 9.4, impressions: 47000, clicks: 940 },
    '틱톡': { cost: 650000, cpc: 280, conversion: 72, cpa: 9028, ctr: 2.1, cvr: 10.9, impressions: 33000, clicks: 660 }
  }

  const mediaOptions = ['네이버', '카카오', '구글', '메타', '틱톡']

  // 키워드별 데이터 페이지에서 사용 가능한 지표들
  const availableMetrics = [
    { id: 'cost', label: '광고비', unit: '원' },
    { id: 'cpc', label: 'CPC', unit: '원' },
    { id: 'conversion', label: '전환수', unit: '개' },
    { id: 'cpa', label: 'CPA', unit: '원' },
    { id: 'ctr', label: 'CTR', unit: '%' },
    { id: 'cvr', label: 'CVR', unit: '%' },
    { id: 'impressions', label: '노출수', unit: '회' },
    { id: 'clicks', label: '클릭수', unit: '회' }
  ]

  // 달성률 계산 함수
  const calculateAchievementRate = (target, current, metricId) => {
    if (!target || !current) return 0
    
    // CPC, CPA는 낮을수록 좋으므로 역산
    if (metricId === 'cpc' || metricId === 'cpa') {
      return target > 0 ? Math.round((target / current) * 100) : 0
    }
    
    // 나머지는 높을수록 좋음
    return target > 0 ? Math.round((current / target) * 100) : 0
  }

  // 달성률에 따른 색상 결정
  const getAchievementColor = (rate) => {
    if (rate >= 100) return '#28a745' // 초록색
    if (rate >= 50) return '#ffc107'   // 노란색
    return '#dc3545' // 빨간색
  }

  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    return num.toLocaleString()
  }

  const currentTargets = kpiTargets[selectedMedia] || {}
  const currentStats = currentPerformance[selectedMedia] || {}

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className={styles.modalContainer} style={{ maxWidth: '900px', width: '90%' }}>
        <div className={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>KPI 달성률 확인</h3>
          <button 
            type="button" 
            className={styles.modalCloseButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className="kpi-view-content">
            {/* 매체 선택 */}
            <div className="kpi-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="media-selector">
                <label htmlFor="kpi-view-media-select" style={{ marginRight: '10px', fontWeight: '600' }}>매체 선택:</label>
                <select 
                  id="kpi-view-media-select"
                  value={selectedMedia}
                  onChange={(e) => setSelectedMedia(e.target.value)}
                  className="kpi-media-select"
                  style={{ 
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                >
                  {mediaOptions.map(media => (
                    <option key={media} value={media}>{media}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                달성률 50% 미만 <span style={{ color: '#dc3545', fontWeight: 'bold' }}>빨간색</span> / 100% 미만 <span style={{ color: '#ffc107', fontWeight: 'bold' }}>노란색</span> / 100% 이상 <span style={{ color: '#28a745', fontWeight: 'bold' }}>초록색</span>
              </div>
            </div>

            {/* KPI 달성률 표시 */}
            <div className="kpi-achievement-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              {availableMetrics.map(metric => {
                const target = currentTargets[metric.id]
                const current = currentStats[metric.id]
                const achievementRate = calculateAchievementRate(target, current, metric.id)
                const color = getAchievementColor(achievementRate)

                return (
                  <div key={metric.id} className="kpi-achievement-card" style={{
                    padding: '15px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                        {metric.label}
                      </h5>
                      <span style={{
                        backgroundColor: color,
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {achievementRate}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>목표:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        {target ? formatNumber(target) : '-'}{metric.unit}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>현재:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: color }}>
                        {current ? formatNumber(current) : '-'}{metric.unit}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className="btn btn-secondary btn-md"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default KpiViewModal