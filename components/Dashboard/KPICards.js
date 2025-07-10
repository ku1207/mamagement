import React from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, BarChart3 } from 'lucide-react';

const KPICards = ({ data, dateRange, selectedFilters }) => {
  // KPI 데이터 계산 (필터링된 데이터 기준)
  const calculateKPIs = () => {
    if (!data || data.length === 0) {
      return {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        roas: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0
      };
    }

    const filteredData = data.filter(item => {
      if (selectedFilters.platforms && selectedFilters.platforms.length > 0) {
        if (!selectedFilters.platforms.includes(item.platform)) return false;
      }
      if (selectedFilters.adTypes && selectedFilters.adTypes.length > 0) {
        if (!selectedFilters.adTypes.includes(item.adType)) return false;
      }
      return true;
    });

    const totals = filteredData.reduce((acc, item) => {
      acc.impressions += item.impressions || 0;
      acc.clicks += item.clicks || 0;
      acc.conversions += item.conversions || 0;
      acc.cost += item.cost || 0;
      acc.revenue += item.revenue || 0;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 });

    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      conversions: totals.conversions,
      cost: totals.cost,
      roas: totals.cost > 0 ? (totals.revenue / totals.cost) : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpc: totals.clicks > 0 ? (totals.cost / totals.clicks) : 0,
      cpa: totals.conversions > 0 ? (totals.cost / totals.conversions) : 0
    };
  };

  const kpis = calculateKPIs();

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    return '₩' + num.toLocaleString();
  };

  const formatPercent = (num) => {
    return num.toFixed(2) + '%';
  };

  const kpiData = [
    {
      title: '노출수',
      value: formatNumber(kpis.impressions),
      icon: <Eye size={20} />,
      color: 'blue',
      trend: 12.5,
      isPositive: true
    },
    {
      title: '클릭수',
      value: formatNumber(kpis.clicks),
      icon: <MousePointer size={20} />,
      color: 'green',
      trend: 8.3,
      isPositive: true
    },
    {
      title: '전환수',
      value: formatNumber(kpis.conversions),
      icon: <Target size={20} />,
      color: 'purple',
      trend: -2.1,
      isPositive: false
    },
    {
      title: '비용',
      value: formatCurrency(kpis.cost),
      icon: <DollarSign size={20} />,
      color: 'red',
      trend: 15.7,
      isPositive: false
    },
    {
      title: 'ROAS',
      value: kpis.roas.toFixed(2),
      icon: <BarChart3 size={20} />,
      color: 'orange',
      trend: 5.2,
      isPositive: true
    },
    {
      title: 'CTR',
      value: formatPercent(kpis.ctr),
      icon: <TrendingUp size={20} />,
      color: 'cyan',
      trend: 3.8,
      isPositive: true
    },
    {
      title: 'CPC',
      value: formatCurrency(kpis.cpc),
      icon: <DollarSign size={20} />,
      color: 'pink',
      trend: -7.2,
      isPositive: true
    },
    {
      title: 'CPA',
      value: formatCurrency(kpis.cpa),
      icon: <Target size={20} />,
      color: 'indigo',
      trend: -4.5,
      isPositive: true
    }
  ];

  return (
    <div className="kpi-grid">
      {kpiData.map((kpi, index) => (
        <div key={index} className="kpi-card">
          <div className="kpi-header">
            <div className={`kpi-icon ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div className={`kpi-trend ${kpi.isPositive ? 'positive' : 'negative'}`}>
              {kpi.isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>{Math.abs(kpi.trend)}%</span>
            </div>
          </div>
          <div className="kpi-value">
            {kpi.value}
          </div>
          <div className="kpi-label">
            {kpi.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards; 