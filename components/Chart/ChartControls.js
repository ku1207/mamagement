// 차트 컨트롤 컴포넌트

import React from 'react'
import { CHART_METRICS, CHART_TYPES, PLATFORM_LABELS, PLATFORM_COLORS } from '../../config/chartConfig'

const ChartControls = ({ 
  selectedMetric, 
  onMetricChange, 
  chartType, 
  onChartTypeChange,
  visiblePlatforms,
  onPlatformToggle 
}) => {
  return (
    <>
      <div className="chart-header">
        <h3 className="chart-title">성과 차트</h3>
        
        <div className="chart-controls">
          {/* 지표 선택 */}
          <div className="chart-control-group">
            <label>지표:</label>
            <select
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value)}
              className="chart-select"
            >
              {CHART_METRICS.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          {/* 차트 타입 선택 */}
          <div className="chart-control-group">
            <label>차트:</label>
            <div className="chart-type-toggle">
              {CHART_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => onChartTypeChange(type.value)}
                  className={`chart-type-button ${chartType === type.value ? 'active' : ''}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 매체 토글 버튼들 */}
      {chartType !== 'pie' && (
        <div className="platform-toggles">
          {Object.entries(PLATFORM_LABELS).map(([platform, label]) => (
            <button
              key={platform}
              onClick={() => onPlatformToggle(platform)}
              className={`platform-toggle ${visiblePlatforms[platform] ? 'active' : ''}`}
            >
              <div 
                className="platform-indicator"
                style={{ backgroundColor: PLATFORM_COLORS[platform] }}
              />
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default ChartControls