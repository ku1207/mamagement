import React, { useState, useMemo } from 'react';

const DataTable = ({ 
  data, 
  selectedFilters, 
  onRowSelect, 
  selectedRows, 
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    impressions: true,
    clicks: true,
    ctr: true,
    cpc: true,
    cost: true
  });

  const columns = [
    { key: 'date', label: '일자', width: '120px' },
    { key: 'impressions', label: '노출수', width: '100px', align: 'right' },
    { key: 'clicks', label: '클릭수', width: '100px', align: 'right' },
    { key: 'ctr', label: 'CTR', width: '80px', align: 'right' },
    { key: 'cpc', label: 'CPC', width: '100px', align: 'right' },
    { key: 'cost', label: '광고비', width: '120px', align: 'right' }
  ];

  const platformLabels = {
    naver: '네이버',
    kakao: '카카오',
    google: '구글',
    facebook: '페이스북'
  };

  const adTypeLabels = {
    search: '검색광고',
    banner: '배너광고',
    video: '영상광고',
    shopping: '쇼핑광고'
  };

  // 데이터 가공 및 필터링
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      ...item,
      id: `${item.platform}-${item.campaign}-${item.adGroup}`,
      platformLabel: platformLabels[item.platform] || item.platform,
      adTypeLabel: adTypeLabels[item.adType] || item.adType,
      ctr: item.impressions > 0 ? parseFloat(((item.clicks / item.impressions) * 100).toFixed(1)) : 0,
      conversionRate: item.clicks > 0 ? (item.conversions / item.clicks) * 100 : 0,
      cpc: item.clicks > 0 ? Math.round(item.cost / item.clicks) : 0,
      cpa: item.conversions > 0 ? (item.cost / item.conversions) : 0,
      roas: item.cost > 0 ? (item.revenue / item.cost) : 0
    }));
  }, [data]);

  // 필터링 및 검색
  const filteredData = useMemo(() => {
    let filtered = [...processedData];

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.date?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.impressions?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clicks?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ctr?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cpc?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cost?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 컬럼 필터
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(item => 
          item[column]?.toString().toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    return filtered;
  }, [processedData, searchTerm, columnFilters]);

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // 숫자 필드 처리
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 문자열 필드 처리
      aValue = aValue?.toString().toLowerCase() || '';
      bValue = bValue?.toString().toLowerCase() || '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 페이지네이션
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleColumnFilter = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleRowSelect = (rowId) => {
    const newSelected = selectedRows?.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];
    
    onRowSelect(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = paginatedData.map(item => item.id);
    const allSelected = allIds.every(id => selectedRows?.includes(id));
    
    if (allSelected) {
      onRowSelect(selectedRows.filter(id => !allIds.includes(id)));
    } else {
      onRowSelect([...new Set([...selectedRows, ...allIds])]);
    }
  };

  const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    switch (column) {
      case 'cost':
        return value.toLocaleString();
      case 'cpc':
        return '₩' + value.toLocaleString();
      case 'ctr':
        return value.toFixed(1) + '%';
      case 'impressions':
      case 'clicks':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <div className="data-table">
      <div className="table-header">
        <h3 className="table-title">데이터 테이블</h3>
        
        <div className="table-controls">
          {/* 검색 */}
          <div className="search-box">
            <input
              type="text"
              placeholder="일자별 데이터 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 컬럼 가시성 토글 */}
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              컬럼 관리
            </button>
          </div>

          {/* 내보내기 버튼 */}
          <button
            onClick={() => onExport(selectedRows.length > 0 ? selectedRows : sortedData)}
            className="export-button"
          >
            내보내기
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="table-wrapper">
        <table className="data-table-element">
          <thead>
            <tr>
              <th style={{ width: '40px', padding: '12px' }}>
                <input
                  type="checkbox"
                  checked={paginatedData.length > 0 && paginatedData.every(item => selectedRows?.includes(item.id))}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px' }}
                />
              </th>
              {columns.map(column => (
                visibleColumns[column.key] && (
                  <th
                    key={column.key}
                    style={{ 
                      width: column.width,
                      textAlign: column.align === 'right' ? 'right' : 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {column.label}
                      {sortConfig.key === column.key && (
                        sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                      )}
                    </div>
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.id}
                className={selectedRows?.includes(row.id) ? 'selected' : ''}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(row.id)}
                    onChange={() => handleRowSelect(row.id)}
                    style={{ width: '16px', height: '16px' }}
                  />
                </td>
                {columns.map(column => (
                  visibleColumns[column.key] && (
                    <td
                      key={column.key}
                      style={{ 
                        textAlign: column.align === 'right' ? 'right' : 'left',
                        padding: '12px'
                      }}
                    >
                      {column.key === 'platform' ? row.platformLabel :
                       column.key === 'adType' ? row.adTypeLabel :
                       formatValue(row[column.key], column.key)}
                    </td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="table-pagination">
        <div className="pagination-info">
          <span>
            총 {sortedData.length}개 중 {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, sortedData.length)}개 표시
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="rows-per-page"
          >
            <option value={10}>10개씩</option>
            <option value={25}>25개씩</option>
            <option value={50}>50개씩</option>
            <option value={100}>100개씩</option>
          </select>
        </div>

        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            이전
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, currentPage - 2) + i;
            if (pageNumber > totalPages) return null;
            
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable; 