import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import EstimatesList from './EstimatesList';
import EstimateDetail from './EstimateDetail';
import CreateEstimate from './CreateEstimate';
import EstimateTemplates from './EstimateTemplates';
import EstimateCompare from './EstimateCompare';

const Estimates: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/templates')) return 1;
    if (location.pathname.includes('/compare')) return 2;
    if (location.pathname.includes('/create')) return 3;
    if (location.pathname.includes('/detail')) return 4;
    return 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/estimates');
        break;
      case 1:
        navigate('/estimates/templates');
        break;
      case 2:
        navigate('/estimates/compare');
        break;
      case 3:
        navigate('/estimates/create');
        break;
    }
  };

  return (
    <Box>
      <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Сметы" />
        <Tab label="Шаблоны" />
        <Tab label="Сравнение" />
        <Tab label="Создать смету" />
      </Tabs>

      <Routes>
        <Route index element={<EstimatesList />} />
        <Route path="templates" element={<EstimateTemplates />} />
        <Route path="compare" element={<EstimateCompare />} />
        <Route path="create" element={<CreateEstimate />} />
        <Route path="detail/:id" element={<EstimateDetail />} />
      </Routes>
    </Box>
  );
};

export default Estimates;