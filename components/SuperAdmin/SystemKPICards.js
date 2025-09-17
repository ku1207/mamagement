// 시스템 KPI 카드 컴포넌트

import React from 'react'
import { formatCurrency } from '../../utils/formatUtils'

const SystemKPICards = ({ systemStats, dateRange }) => {
  const systemKPIs = [
    {
      title: '전체 사용자',
      value: systemStats.totalUsers,
      color: 'blue',
      trend: 12,
      isPositive: true
    },
    {
      title: '등록 광고주',
      value: systemStats.totalAdvertisers,
      color: 'green',
      trend: 8,
      isPositive: true
    },
    {
      title: '활성 사용자',
      value: systemStats.activeUsers,
      color: 'purple',
      trend: 15,
      isPositive: true
    },
    {
      title: '총 매출',
      value: formatCurrency(systemStats.totalRevenue),
      color: 'orange',
      trend: systemStats.monthlyGrowth,
      isPositive: true,
      subtitle: `${dateRange.startDate.toLocaleDateString()} ~ ${dateRange.endDate.toLocaleDateString()}`
    }
  ]

  return (
    <div className="kpi-grid">
      {systemKPIs.map((kpi, index) => (
        <div key={index} className="kpi-card">
          <div className="kpi-header">
            <div className={`kpi-icon ${kpi.color}`}>
            </div>
            {kpi.trend > 0 && (
              <div className={`kpi-trend ${kpi.isPositive ? 'positive' : 'negative'}`}>
                <span>+{kpi.trend}%</span>
              </div>
            )}
          </div>
          <div className="kpi-value">
            {kpi.value}
          </div>
          <div className="kpi-label">
            {kpi.title}
            {kpi.subtitle && (
              <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '2px' }}>
                {kpi.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SystemKPICards