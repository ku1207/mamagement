import React from 'react';

const ExportBar = ({ selectedRows, data, onExport, onClear }) => {
  if (!selectedRows || selectedRows.length === 0) return null;

  // 선택된 행들의 합계 계산
  const calculateTotals = () => {
    if (!data || !Array.isArray(data)) return { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 };
    
    const selectedData = data.filter(item => 
      selectedRows.includes(`${item.platform}-${item.campaign}-${item.adGroup}`)
    );

    return selectedData.reduce((acc, item) => {
      acc.impressions += item.impressions || 0;
      acc.clicks += item.clicks || 0;
      acc.conversions += item.conversions || 0;
      acc.cost += item.cost || 0;
      acc.revenue += item.revenue || 0;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 });
  };

  const totals = calculateTotals();
  const ctr = totals.impressions > 0 ? parseFloat(((totals.clicks / totals.impressions) * 100).toFixed(1)) : 0;
  const roas = totals.cost > 0 ? (totals.revenue / totals.cost) : 0;
  const cpc = totals.clicks > 0 ? Math.round(totals.cost / totals.clicks) : 0;
  const cpa = totals.conversions > 0 ? (totals.cost / totals.conversions) : 0;
  const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    return num.toLocaleString();
  };

  const exportOptions = [
    {
      type: 'csv',
      label: 'CSV 파일',
      description: '엑셀에서 열 수 있는 CSV 형식'
    },
    {
      type: 'excel',
      label: 'Excel 파일',
      description: '엑셀 파일(.xlsx)'
    },
    {
      type: 'pdf',
      label: 'PDF 보고서',
      description: '인쇄 가능한 PDF 보고서'
    },
    {
      type: 'image',
      label: '이미지',
      description: '차트 이미지 (PNG)'
    }
  ];

  return (
    <div className="export-bar">
      <div className="export-bar-content">
        {/* 선택된 항목 정보 */}
        <div className="export-bar-left">
          <div className="selection-info">
            <span>
              선택된 캠페인: {selectedRows.length}개
            </span>
            <button
              onClick={onClear}
              className="clear-selection"
              title="선택 해제"
            >
              X
            </button>
          </div>

          {/* 선택된 항목 합계 KPI */}
          <div className="kpi-summary">
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">노출수</span>
              <span className="kpi-summary-value">{formatNumber(totals.impressions)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">클릭수</span>
              <span className="kpi-summary-value">{formatNumber(totals.clicks)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">전환수</span>
              <span className="kpi-summary-value">{formatNumber(totals.conversions)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">비용</span>
              <span className="kpi-summary-value">{formatCurrency(totals.cost)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">CTR</span>
              <span className="kpi-summary-value">{ctr.toFixed(1)}%</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">ROAS</span>
              <span className="kpi-summary-value">{roas.toFixed(2)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">CPC</span>
              <span className="kpi-summary-value">{formatCurrency(cpc)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">CPA</span>
              <span className="kpi-summary-value">{formatCurrency(cpa)}</span>
            </div>
            <div className="kpi-summary-item">
              <span className="kpi-summary-label">전환율</span>
              <span className="kpi-summary-value">{conversionRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* 내보내기 버튼들 */}
        <div className="export-options">
          {exportOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => onExport(option.type, selectedRows)}
              className="export-option"
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportBar; 