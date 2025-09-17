// 인터랙티브 차트 (모듈화된 버전)

import React, { useState, useMemo } from 'react'
import { ResponsiveContainer } from 'recharts'
import ChartControls from '../Chart/ChartControls'
import ChartRenderer from '../Chart/ChartRenderer'
import { DEFAULT_VISIBLE_PLATFORMS } from '../../config/chartConfig'
import { processChartData, processPieData } from '../../utils/chartUtils'

const InteractiveChart = ({ data, selectedFilters, dateRange, title = '성과 차트' }) => {
  const [chartType, setChartType] = useState('line')
  const [selectedMetric, setSelectedMetric] = useState('impressions')
  const [visiblePlatforms, setVisiblePlatforms] = useState(DEFAULT_VISIBLE_PLATFORMS)

  // 차트 데이터 가공
  const processedData = useMemo(() => {
    return processChartData(data, selectedMetric)
  }, [data, selectedMetric])

  // 원형 차트용 데이터
  const pieData = useMemo(() => {
    return processPieData(data, selectedMetric)
  }, [data, selectedMetric])

  const handlePlatformToggle = (platform) => {
    setVisiblePlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  return (
    <div className="chart-section">
      <ChartControls
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        chartType={chartType}
        onChartTypeChange={setChartType}
        visiblePlatforms={visiblePlatforms}
        onPlatformToggle={handlePlatformToggle}
      />

      {/* 차트 렌더링 */}
      <div className="chart-container">
        <ResponsiveContainer>
          <ChartRenderer
            chartType={chartType}
            processedData={processedData}
            pieData={pieData}
            visiblePlatforms={visiblePlatforms}
            selectedMetric={selectedMetric}
          />
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default InteractiveChart