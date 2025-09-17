// 광고주 업종별 성과 분석 컴포넌트

import React from 'react'
import { useAuth } from '../../context/AuthContext'

const BusinessAnalysis = ({ dateRange }) => {
  const { advertisers } = useAuth()

  return (
    <div className="dashboard-section">
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '20px' }}>
        광고주 업종별 성과 분석 
        <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '400' }}>
          ({dateRange.startDate.toLocaleDateString()} ~ {dateRange.endDate.toLocaleDateString()})
        </span>
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* 업종별 월 평균 광고비 */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#495057', marginBottom: '15px' }}>
            업종별 월 평균 광고비 (단위: 백만원)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {advertisers.map((advertiser, index) => {
              const avgSpend = Math.floor(Math.random() * 500) + 100
              const maxSpend = 600
              const percentage = (avgSpend / maxSpend) * 100
              const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
              
              return (
                <div key={index} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#495057' }}>{advertiser.business}</span>
                    <span style={{ color: '#6c757d', fontWeight: '600' }}>{avgSpend}백만원</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e9ecef', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      backgroundColor: colors[index % colors.length],
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                    {advertiser.name} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 업종별 ROI 성과 */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#495057', marginBottom: '15px' }}>
            업종별 ROI 성과 (Return on Investment)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {advertisers.map((advertiser, index) => {
              const roi = Math.floor(Math.random() * 300) + 150
              const isPositive = roi > 200
              const roiColor = isPositive ? '#28a745' : roi > 150 ? '#ffc107' : '#dc3545'
              
              return (
                <div key={index} style={{ 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px', 
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                      {advertiser.business}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      {advertiser.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '700', 
                      color: roiColor,
                      marginBottom: '4px'
                    }}>
                      {roi}%
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: roiColor,
                      fontWeight: '600'
                    }}>
                      {isPositive ? '우수' : roi > 150 ? '보통' : '개선필요'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessAnalysis