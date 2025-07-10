import React, { useState, useMemo } from 'react';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const InteractiveChart = ({ data, selectedFilters, dateRange }) => {
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [visiblePlatforms, setVisiblePlatforms] = useState({
    naver: true,
    kakao: true,
    google: true,
    facebook: true
  });

  const metrics = [
    { value: 'impressions', label: '노출수' },
    { value: 'clicks', label: '클릭수' },
    { value: 'conversions', label: '전환수' },
    { value: 'cost', label: '비용' },
    { value: 'ctr', label: 'CTR (%)' },
    { value: 'cpc', label: 'CPC' },
    { value: 'cpa', label: 'CPA' },
    { value: 'roas', label: 'ROAS' }
  ];

  const chartTypes = [
    { value: 'line', label: '선형 차트', icon: <LineChartIcon size={16} /> },
    { value: 'bar', label: '막대 차트', icon: <BarChartIcon size={16} /> },
    { value: 'area', label: '영역 차트', icon: <TrendingUp size={16} /> },
    { value: 'pie', label: '원형 차트', icon: <PieChartIcon size={16} /> }
  ];

  const platformColors = {
    naver: '#1EC800',
    kakao: '#FFE812',
    google: '#4285F4',
    facebook: '#1877F2'
  };

  const platformLabels = {
    naver: '네이버',
    kakao: '카카오',
    google: '구글',
    facebook: '페이스북'
  };

  // 차트 데이터 가공
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 날짜별로 그룹화하고 매체별로 합계 계산
    const groupedData = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          naver: 0,
          kakao: 0,
          google: 0,
          facebook: 0
        };
      }
      
      // 선택된 지표에 따라 값 계산
      let value = 0;
      switch (selectedMetric) {
        case 'impressions':
          value = item.impressions || 0;
          break;
        case 'clicks':
          value = item.clicks || 0;
          break;
        case 'conversions':
          value = item.conversions || 0;
          break;
        case 'cost':
          value = item.cost || 0;
          break;
        case 'ctr':
          value = item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0;
          break;
        case 'cpc':
          value = item.clicks > 0 ? (item.cost / item.clicks) : 0;
          break;
        case 'cpa':
          value = item.conversions > 0 ? (item.cost / item.conversions) : 0;
          break;
        case 'roas':
          value = item.cost > 0 ? (item.revenue / item.cost) : 0;
          break;
        default:
          value = 0;
      }
      
      acc[date][item.platform] += value;
      return acc;
    }, {});

    return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data, selectedMetric]);

  // 원형 차트용 데이터
  const pieData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const platformTotals = data.reduce((acc, item) => {
      if (!acc[item.platform]) acc[item.platform] = 0;
      
      let value = 0;
      switch (selectedMetric) {
        case 'impressions':
          value = item.impressions || 0;
          break;
        case 'clicks':
          value = item.clicks || 0;
          break;
        case 'conversions':
          value = item.conversions || 0;
          break;
        case 'cost':
          value = item.cost || 0;
          break;
        default:
          value = item[selectedMetric] || 0;
      }
      
      acc[item.platform] += value;
      return acc;
    }, {});

    return Object.entries(platformTotals).map(([platform, value]) => ({
      name: platformLabels[platform],
      value,
      color: platformColors[platform]
    }));
  }, [data, selectedMetric]);

  const handlePlatformToggle = (platform) => {
    setVisiblePlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const formatValue = (value) => {
    if (selectedMetric === 'cost' || selectedMetric === 'cpc' || selectedMetric === 'cpa') {
      return '₩' + value.toLocaleString();
    } else if (selectedMetric === 'ctr') {
      return value.toFixed(2) + '%';
    } else if (selectedMetric === 'roas') {
      return value.toFixed(2);
    }
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
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
              {platformLabels[entry.dataKey]}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 400,
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.entries(visiblePlatforms).map(([platform, visible]) => 
              visible && (
                <Line 
                  key={platform}
                  type="monotone" 
                  dataKey={platform} 
                  stroke={platformColors[platform]}
                  strokeWidth={2}
                  dot={{ fill: platformColors[platform], strokeWidth: 2, r: 4 }}
                  name={platformLabels[platform]}
                />
              )
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.entries(visiblePlatforms).map(([platform, visible]) => 
              visible && (
                <Bar 
                  key={platform}
                  dataKey={platform} 
                  fill={platformColors[platform]}
                  name={platformLabels[platform]}
                />
              )
            )}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.entries(visiblePlatforms).map(([platform, visible]) => 
              visible && (
                <Area 
                  key={platform}
                  type="monotone" 
                  dataKey={platform} 
                  stackId="1"
                  stroke={platformColors[platform]}
                  fill={platformColors[platform]}
                  fillOpacity={0.3}
                  name={platformLabels[platform]}
                />
              )
            )}
          </AreaChart>
        );

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
              <Tooltip formatter={(value) => formatValue(value)} />
            </PieChart>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-title">성과 차트</h3>
        
        <div className="chart-controls">
          {/* 지표 선택 */}
          <div className="chart-control-group">
            <label>지표:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="chart-select"
            >
              {metrics.map(metric => (
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
              {chartTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`chart-type-button ${chartType === type.value ? 'active' : ''}`}
                >
                  {type.icon}
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
          {Object.entries(platformLabels).map(([platform, label]) => (
            <button
              key={platform}
              onClick={() => handlePlatformToggle(platform)}
              className={`platform-toggle ${visiblePlatforms[platform] ? 'active' : ''}`}
            >
              <div 
                className="platform-indicator"
                style={{ backgroundColor: platformColors[platform] }}
              />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 차트 렌더링 */}
      <div className="chart-container">
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InteractiveChart; 