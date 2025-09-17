// 차트 렌더링 컴포넌트

import React from 'react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart,
  Pie,
  Cell
} from 'recharts'
import CustomTooltip from './CustomTooltip'
import { PLATFORM_COLORS, PLATFORM_LABELS, CHART_COMMON_PROPS } from '../../config/chartConfig'
import { formatChartValue } from '../../utils/chartUtils'

const ChartRenderer = ({ 
  chartType, 
  processedData, 
  pieData, 
  visiblePlatforms, 
  selectedMetric 
}) => {
  const commonProps = {
    ...CHART_COMMON_PROPS,
    data: processedData
  }

  switch (chartType) {
    case 'line':
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip selectedMetric={selectedMetric} />} />
          <Legend />
          {Object.entries(visiblePlatforms).map(([platform, visible]) => 
            visible && (
              <Line 
                key={platform}
                type="monotone" 
                dataKey={platform} 
                stroke={PLATFORM_COLORS[platform]}
                strokeWidth={2}
                dot={{ fill: PLATFORM_COLORS[platform], strokeWidth: 2, r: 4 }}
                name={PLATFORM_LABELS[platform]}
              />
            )
          )}
        </LineChart>
      )

    case 'bar':
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip selectedMetric={selectedMetric} />} />
          <Legend />
          {Object.entries(visiblePlatforms).map(([platform, visible]) => 
            visible && (
              <Bar 
                key={platform}
                dataKey={platform} 
                fill={PLATFORM_COLORS[platform]}
                name={PLATFORM_LABELS[platform]}
              />
            )
          )}
        </BarChart>
      )

    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip selectedMetric={selectedMetric} />} />
          <Legend />
          {Object.entries(visiblePlatforms).map(([platform, visible]) => 
            visible && (
              <Area 
                key={platform}
                type="monotone" 
                dataKey={platform} 
                stackId="1"
                stroke={PLATFORM_COLORS[platform]}
                fill={PLATFORM_COLORS[platform]}
                fillOpacity={0.3}
                name={PLATFORM_LABELS[platform]}
              />
            )
          )}
        </AreaChart>
      )

    case 'pie':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatChartValue(value, selectedMetric)} />
          </PieChart>
        </div>
      )

    default:
      return null
  }
}

export default ChartRenderer