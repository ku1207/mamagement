// 대시보드 콘텐츠 컴포넌트

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.js'
import SuperAdminDashboard from '../Dashboard/SuperAdminDashboard.js'
import FilterSection from '../Dashboard/FilterSection.js'
import KPICards from '../Dashboard/KPICards.js'
import InteractiveChart from '../Dashboard/InteractiveChart.js'
import DataTable from '../Dashboard/DataTable.js'
import ExportBar from '../Dashboard/ExportBar.js'
import { generateDailyData } from '../../utils/mediaDataGenerator.js'
import { utils } from '../../utils/dashboardUtils.js'

const DashboardContent = () => {
  return (
    <div className="content-area" style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      {/* 흰색 여백 */}
    </div>
  )
}

export default DashboardContent