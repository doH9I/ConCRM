import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import FinancialDashboard from './FinancialDashboard';
import Operations from './Operations';
import Budgets from './Budgets';
import Reports from './Reports';

const Financial: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/operations')) return 1;
    if (location.pathname.includes('/budgets')) return 2;
    if (location.pathname.includes('/reports')) return 3;
    return 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/financial');
        break;
      case 1:
        navigate('/financial/operations');
        break;
      case 2:
        navigate('/financial/budgets');
        break;
      case 3:
        navigate('/financial/reports');
        break;
    }
  };

  return (
    <Box>
      <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Обзор" />
        <Tab label="Операции" />
        <Tab label="Бюджеты" />
        <Tab label="Отчеты" />
      </Tabs>

      <Routes>
        <Route index element={<FinancialDashboard />} />
        <Route path="operations" element={<Operations />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </Box>
  );
};

export default Financial;