// 차트 커스텀 툴팁 컴포넌트

import React from 'react'
import { PLATFORM_LABELS } from '../../config/chartConfig'
import { formatChartValue } from '../../utils/chartUtils'

const CustomTooltip = ({ active, payload, label, selectedMetric }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        padding: '12px',
        border: '1px solid #e9ecef',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
          날짜: {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ fontSize: '0.9rem', color: entry.color, margin: '4px 0' }}>
            {PLATFORM_LABELS[entry.dataKey]}: {formatChartValue(entry.value, selectedMetric)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default CustomTooltip